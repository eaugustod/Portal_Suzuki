import ftplib
import os
import re
import json
import xlrd
import openpyxl
import sys
import gc
import time
import datetime

# Root configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))

PUBLIC_CATALOGS_DIR = os.path.join(PROJECT_ROOT, 'public', 'catalogos')
GENERATED_DATA_DIR = os.path.join(PROJECT_ROOT, 'src', 'data', 'generated_catalogs')
TEMP_DOWNLOAD_DIR = os.path.join(PROJECT_ROOT, 'scripts', '.tmp_ftp_download')
CHECKPOINT_FILE = os.path.join(PROJECT_ROOT, 'scripts', 'ftp_integration_checkpoint.json')
REPORT_FILE = os.path.join(PROJECT_ROOT, 'scripts', 'ftp_integration_report.json')

os.makedirs(PUBLIC_CATALOGS_DIR, exist_ok=True)
os.makedirs(GENERATED_DATA_DIR, exist_ok=True)
os.makedirs(TEMP_DOWNLOAD_DIR, exist_ok=True)

KNOWN_SLUGS = [
    "hayabusa_m5", "gsx_s1000gx_m5", "gsx_s1000gt_m5", "gsx_8s_m5", "gsx_8s_m6",
    "gsx_8r_m6", "vstrom_800_m5", "vstrom_800de_m6", "vstrom_1050_m5", "vstrom_1050_m6",
    "vstrom_650xt_m5", "vstrom_650xt_m6", "gsx_s1000_m5", "gsx_s1000_m6", "hayabusa_m6",
    "master_ride_p5", "haojue_dl160", "zontes_368g", "zontes_t501"
]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '_', text)
    return text

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Erro ao carregar checkpoint ({e}). Criando novo.")
    return {"last_updated": None, "models": {}}

def save_checkpoint(checkpoint):
    checkpoint["last_updated"] = datetime.datetime.now().isoformat()
    try:
        with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[!] Erro ao salvar checkpoint: {e}")

def update_model_checkpoint(slug, brand, ftp_brand, model_name, status, error=None, stats=None):
    checkpoint = load_checkpoint()
    if "models" not in checkpoint:
        checkpoint["models"] = {}
    if slug not in checkpoint["models"]:
        checkpoint["models"][slug] = {}
    
    entry = checkpoint["models"][slug]
    entry["slug"] = slug
    entry["brand"] = brand
    entry["ftp_brand"] = ftp_brand
    entry["model_name"] = model_name
    entry["status"] = status
    entry["updated_at"] = datetime.datetime.now().isoformat()
    if error is not None:
        entry["error"] = str(error)
    elif status == "COMPLETED":
        entry["error"] = None
    
    if stats:
        entry.update(stats)
        
    save_checkpoint(checkpoint)

def get_ftp_connection(server, user, pwd, timeout=30, max_retries=3):
    for attempt in range(1, max_retries + 1):
        try:
            ftp = ftplib.FTP(timeout=timeout)
            ftp.connect(server)
            ftp.login(user, pwd)
            return ftp
        except Exception as e:
            print(f"    [!] Tentativa {attempt}/{max_retries} de conexão FTP com {server} falhou: {e}")
            if attempt < max_retries:
                time.sleep(2)
            else:
                raise e

def parse_generic_excel(filepath):
    rows = []
    wb = None
    if filepath.lower().endswith('.xls'):
        try:
            wb = xlrd.open_workbook(filepath)
            sheet = wb.sheet_by_index(0)
            for r in range(sheet.nrows):
                rows.append([sheet.cell_value(r, c) for c in range(sheet.ncols)])
        except Exception as e:
            print(f"    [!] Erro lendo XLS {filepath}: {e}")
            return []
    else:
        try:
            wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
            sheet = wb.active
            for row in sheet.iter_rows(values_only=True):
                rows.append(list(row))
        except Exception as e:
            print(f"    [!] Erro lendo XLSX {filepath}: {e}")
            return []
        finally:
            if wb and hasattr(wb, 'close'):
                try:
                    wb.close()
                except Exception:
                    pass

    if not rows:
        return []

    # Detecta tipo de cabeçalho
    header_idx = -1
    col_map = {}
    
    for i, row in enumerate(rows[:20]):
        if not row: continue
        str_row = [str(c).upper().strip() if c is not None else '' for c in row]
        
        # Tipo 1 (Tabela com colunas explicitas)
        if 'PART NO' in str_row or 'PART_NO' in str_row or 'PART NO.' in str_row:
            header_idx = i
            for c_i, name in enumerate(str_row):
                if 'FIGURA' in name or 'FIG' in name: col_map['fig'] = c_i
                elif 'NOME PECA' in name or 'TITLE' in name: col_map['fig_title'] = c_i
                elif 'GRUPO' in name: col_map['group'] = c_i
                elif 'REF' in name: col_map['ref'] = c_i
                elif 'PART' in name: col_map['part'] = c_i
                elif 'DESCRIPTION' in name or 'DESCR' in name or 'NOME' in name:
                    if 'fig_title' not in col_map or col_map['fig_title'] != c_i:
                        col_map['desc'] = c_i
                elif 'QTY' in name or 'Q\'TY' in name or 'QTD' in name: col_map['qty'] = c_i
            break

    diagrams_dict = {}

    if header_idx != -1 and 'part' in col_map:
        # Processa formato tabular continuo (Tipo 1)
        fig_col = col_map.get('fig', -1)
        fig_title_col = col_map.get('fig_title', -1)
        group_col = col_map.get('group', -1)
        ref_col = col_map.get('ref', -1)
        part_col = col_map.get('part', -1)
        desc_col = col_map.get('desc', -1)
        qty_col = col_map.get('qty', -1)

        for row in rows[header_idx + 1:]:
            if not row: continue
            str_row = [str(c).strip() if c is not None else '' for c in row]
            if not any(str_row): continue

            fig_key = str_row[fig_col] if fig_col != -1 and fig_col < len(str_row) else 'FIG1'
            if not fig_key: fig_key = 'FIG1'

            fig_title = str_row[fig_title_col] if fig_title_col != -1 and fig_title_col < len(str_row) else fig_key
            group_name = str_row[group_col] if group_col != -1 and group_col < len(str_row) else 'Geral'
            ref_val = str_row[ref_col] if ref_col != -1 and ref_col < len(str_row) else '1'
            part_no = str_row[part_col] if part_col != -1 and part_col < len(str_row) else ''
            desc_val = str_row[desc_col] if desc_col != -1 and desc_col < len(str_row) else ''
            qty_val = str_row[qty_col] if qty_col != -1 and qty_col < len(str_row) else '1'

            if not part_no or part_no.upper() in ['PART NO', 'PART NO.', 'PART_NO'] or part_no.startswith(('SUZ-', 'HAO-', 'ZON-', 'PARTS-')):
                continue

            ref_num = 1
            try:
                ref_num = int(float(str(ref_val).split('-')[0].replace('a','').replace('b','')))
            except:
                pass

            if ref_num <= 0 or ref_num > 500:
                continue

            if fig_key not in diagrams_dict:
                diagrams_dict[fig_key] = {
                    'title': fig_title if fig_title else fig_key,
                    'group': group_name if group_name else 'Geral',
                    'items': []
                }

            diagrams_dict[fig_key]['items'].append({
                'ref': ref_num,
                'ref_raw': ref_val,
                'partNumber': part_no,
                'description': desc_val,
                'qty': str(qty_val)
            })

        del rows
        gc.collect()
        return list(diagrams_dict.values())

    # Formato autoware clássico (com blocos Fig.1)
    diagrams = []
    current_diag = None

    for row in rows:
        if not row: continue
        str_row = [str(c).strip() if c is not None else '' for c in row]
        if not any(str_row): continue

        first_col = str_row[0]
        second_col = str_row[1] if len(str_row) > 1 else ''

        is_fig_title = False
        title_str = ""
        if re.match(r'^(fig|figura)\b', first_col, re.IGNORECASE):
            is_fig_title = True
            title_str = first_col
        elif re.match(r'^(fig|figura)\b', second_col, re.IGNORECASE):
            is_fig_title = True
            title_str = second_col
        elif re.match(r'^[E|F]\d{2}\b', first_col, re.IGNORECASE):
            is_fig_title = True
            title_str = first_col

        if is_fig_title:
            if current_diag and current_diag['items']:
                diagrams.append(current_diag)
            current_diag = {
                'title': title_str,
                'group': 'Geral',
                'items': []
            }
            continue

        if current_diag:
            ref = str_row[0]
            ref_clean = ref.replace('.', '').replace(',', '')
            if ref_clean.isdigit():
                try:
                    ref_num = int(float(ref))
                except:
                    continue
                part_no = str_row[1] if len(str_row) > 1 else ''
                desc = ''
                qty = '1'
                if len(str_row) >= 4 and str_row[3]:
                    desc = str_row[3]
                elif len(str_row) >= 3 and str_row[2]:
                    desc = str_row[2]
                if len(str_row) >= 5 and str_row[4]:
                    qty = str_row[4]

                if part_no and part_no.upper() not in ['PART NO.', 'PART NO', 'PART_NO']:
                    current_diag['items'].append({
                        'ref': ref_num,
                        'ref_raw': str(ref_num),
                        'partNumber': part_no,
                        'description': desc,
                        'qty': str(qty)
                    })

    if current_diag and current_diag['items']:
        diagrams.append(current_diag)

    del rows
    gc.collect()
    return diagrams

MOCK_MODELS_FILE = os.path.join(PROJECT_ROOT, 'src', 'data', 'mockPartsModels.ts')

def sync_model_to_mock_parts_models(model_summary):
    if not os.path.exists(MOCK_MODELS_FILE):
        return
    try:
        with open(MOCK_MODELS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        model_id = model_summary["id"]
        image_url = model_summary["image"]

        id_pattern = rf"id:\s*['\"]{re.escape(model_id)}['\"]"
        if re.search(id_pattern, content):
            entry_match = re.search(rf"(\{{\s*id:\s*['\"]{re.escape(model_id)}['\"].*?image:\s*['\"])([^'\"]+)(['\"].*?\}})", content, re.DOTALL)
            if entry_match:
                old_img = entry_match.group(2)
                if old_img != image_url:
                    content = content[:entry_match.start(2)] + image_url + content[entry_match.end(2):]
                    print(f"    [✓] Atualizada imagem no mockPartsModels.ts: {old_img} -> {image_url}")
        else:
            new_entry = f"""  {{
    id: '{model_id}',
    brand: '{model_summary["brand"]}',
    name: '{model_summary["name"]}',
    commercialName: '{model_summary["commercialName"]}',
    years: '2024 - 2027',
    displacement: '150 cc',
    category: 'EPC Catalog',
    image: '{image_url}',
    engineType: 'Catálogo Genuine Parts Autoware',
    diagramsCount: {model_summary["diagramsCount"]},
    totalPartsCount: {model_summary["totalPartsCount"]},
    chassisPrefix: '95VHAOJU',
    startingPrice: 15000
  }},
"""
            last_bracket = content.rfind('];')
            if last_bracket != -1:
                content = content[:last_bracket] + new_entry + content[last_bracket:]
                print(f"    [✓] Adicionado novo modelo no mockPartsModels.ts: {model_id}")

        with open(MOCK_MODELS_FILE, 'w', encoding='utf-8') as f:
            f.write(content)

    except Exception as e:
        print(f"    [!] Erro ao sincronizar {model_summary['id']} com mockPartsModels.ts: {e}")

def process_single_model(server, user, pwd, brand_name, default_brand, model_name, index, total):
    model_slug = slugify(f"{default_brand}_{model_name}")
    print(f"\n[{index}/{total}] Processando Modelo: {model_name} (slug: {model_slug})...")
    sys.stdout.flush()

    update_model_checkpoint(model_slug, default_brand, brand_name, model_name, "IN_PROGRESS")

    local_excel_path = None
    ftp = None

    try:
        ftp = get_ftp_connection(server, user, pwd)
        model_ftp_path = f'/catalogos_autoware/{brand_name}/{model_name}'

        try:
            ftp.cwd(model_ftp_path)
            m_items = []
            ftp.retrlines('LIST', lambda l: m_items.append(l))
        except Exception as e:
            reason = f"Erro FTP ao acessar pasta do modelo: {e}"
            print(f"    [-] {reason}")
            update_model_checkpoint(model_slug, default_brand, brand_name, model_name, "FAILED", error=reason)
            return None

        xls_files = []
        root_img_files = []
        img_dir_name = None
        for line in m_items:
            fname = line.split(maxsplit=8)[-1]
            fname_lower = fname.lower()
            if not line.startswith('d'):
                if (fname_lower.endswith('.xls') or fname_lower.endswith('.xlsx')) and not fname.startswith('~$'):
                    xls_files.append(fname)
                elif fname_lower.endswith(('.jpg', '.jpeg', '.png', '.webp', '.bmp')):
                    root_img_files.append(fname)
            elif line.startswith('d') and 'imagens' in fname_lower:
                img_dir_name = fname

        if not xls_files:
            reason = "Planilha Excel não encontrada no FTP"
            print(f"    [-] {reason}")
            update_model_checkpoint(model_slug, default_brand, brand_name, model_name, "FAILED", error=reason)
            return None

        excel_filename = xls_files[0]
        local_excel_path = os.path.join(TEMP_DOWNLOAD_DIR, f"{model_slug}_{excel_filename}")

        print(f"    [↓] Baixando planilha {excel_filename}...")
        sys.stdout.flush()

        with open(local_excel_path, 'wb') as f:
            ftp.retrbinary(f"RETR {excel_filename}", f.write)

        diagrams_raw = parse_generic_excel(local_excel_path)
        if not diagrams_raw:
            reason = "Estrutura da planilha incompatível ou sem peças extraídas"
            print(f"    [-] {reason}")
            update_model_checkpoint(model_slug, default_brand, brand_name, model_name, "FAILED", error=reason)
            return None

        local_img_model_dir = os.path.join(PUBLIC_CATALOGS_DIR, model_slug)
        os.makedirs(local_img_model_dir, exist_ok=True)

        # Identifica a imagem da moto na raiz da pasta do modelo (junto com a planilha)
        hero_img_filename = None
        if root_img_files:
            priority_keywords = ['moto', 'modelo', 'hero', 'cover', 'main', 'capa', 'menu', 'foto', 'oficial']
            for kw in priority_keywords:
                for img_f in root_img_files:
                    if kw in img_f.lower():
                        hero_img_filename = img_f
                        break
                if hero_img_filename:
                    break
            if not hero_img_filename:
                hero_img_filename = root_img_files[0]

        model_image_url = f"/catalogos/{model_slug}/fig1.jpg"
        if hero_img_filename:
            ext = os.path.splitext(hero_img_filename)[1].lower()
            if ext == '.eps':
                ext = '.jpg'
            hero_save_name = f"model_cover{ext}"
            hero_local_path = os.path.join(local_img_model_dir, hero_save_name)
            try:
                print(f"    [↓] Baixando imagem da moto ({hero_img_filename})...")
                sys.stdout.flush()
                ftp.cwd(model_ftp_path)
                with open(hero_local_path, 'wb') as hero_f:
                    ftp.retrbinary(f"RETR {hero_img_filename}", hero_f.write)
                model_image_url = f"/catalogos/{model_slug}/{hero_save_name}"
                print(f"    [✓] Imagem da moto salva em: {model_image_url}")
            except Exception as e:
                print(f"    [!] Falha ao baixar imagem da moto ({hero_img_filename}): {e}")

        ftp_img_files = {}
        if img_dir_name:
            try:
                ftp.cwd(f"{model_ftp_path}/{img_dir_name}")
                sub_img_items = []
                ftp.retrlines('LIST', lambda l: sub_img_items.append(l))

                fig_subfolder = None
                for line in sub_img_items:
                    sf_name = line.split(maxsplit=8)[-1]
                    if line.startswith('d') and sf_name.lower() in ['figg', 'figm', 'figp', 'a4', 'fig. rev']:
                        fig_subfolder = sf_name
                        if sf_name.lower() == 'figg': break

                target_img_dir = f"{model_ftp_path}/{img_dir_name}"
                if fig_subfolder:
                    target_img_dir += f"/{fig_subfolder}"

                ftp.cwd(target_img_dir)
                img_file_lines = []
                ftp.retrlines('LIST', lambda l: img_file_lines.append(l))

                for line in img_file_lines:
                    if not line.startswith('d'):
                        fname = line.split(maxsplit=8)[-1]
                        if fname.lower().endswith('.jpg') or fname.lower().endswith('.eps') or fname.lower().endswith('.png'):
                            ftp_img_files[fname.lower()] = (fname, target_img_dir)

            except Exception as e:
                print(f"    [!] Aviso ao listar diretório de imagens: {e}")

        converted_diagrams = []
        for idx, diag in enumerate(diagrams_raw):
            fig_num = idx + 1
            fig_id = f"fig{fig_num}"
            diag_title = diag['title']
            group_name = diag.get('group', 'Geral')

            image_filename = f"fig{fig_num}.jpg"
            if ftp_img_files:
                matched_fname = None
                for key in ftp_img_files:
                    if f"fig{fig_num}." in key or f"fig{fig_num:02d}." in key or f"e{fig_num:02d}." in key or f"f{fig_num:02d}." in key or f"fig_{fig_num}." in key:
                        matched_fname = ftp_img_files[key][0]
                        target_dir = ftp_img_files[key][1]
                        break

                if matched_fname:
                    ext = os.path.splitext(matched_fname)[1].lower()
                    if ext == '.eps': ext = '.jpg'
                    local_img_save_name = f"fig{fig_num}{ext}"
                    local_img_path = os.path.join(local_img_model_dir, local_img_save_name)
                    try:
                        ftp.cwd(target_dir)
                        with open(local_img_path, 'wb') as img_f:
                            ftp.retrbinary(f"RETR {matched_fname}", img_f.write)
                        image_filename = local_img_save_name
                    except Exception as e:
                        print(f"    [!] Falha ao baixar imagem {matched_fname}: {e}")

            hotspots = []
            for item in diag['items']:
                ref = item['ref']
                if 1 <= ref <= 500:
                    hotspots.append({
                        "id": f"hs-{model_slug}-{fig_id}-{ref}",
                        "ref": ref,
                        "x": 50.0,
                        "y": 50.0,
                        "label": f"{ref} - {item['description']}"
                    })

            parts_list = []
            for p_idx, item in enumerate(diag['items']):
                item_ref = item['ref']
                item_part_num = item['partNumber']
                item_desc = item['description']
                raw_qty = item['qty']
                unit_qty = int(raw_qty) if str(raw_qty).isdigit() else 1

                if 1 <= item_ref <= 500 and item_part_num and not item_part_num.startswith(('SUZ-', 'HAO-', 'ZON-', 'PARTS-')):
                    parts_list.append({
                        "id": f"part-{model_slug}-{fig_id}-{item_ref}-{p_idx}",
                        "ref": item_ref,
                        "partNumber": item_part_num,
                        "description": item_desc,
                        "unitQuantity": unit_qty,
                        "factoryPrice": 100.0,
                        "msrpPrice": 150.0,
                        "stockJundiai": 10,
                        "stockManaus": 5,
                        "inStock": True,
                        "categoryGroup": group_name
                    })

            converted_diagrams.append({
                "id": f"diag-{model_slug}-{fig_id}",
                "groupCode": "1",
                "groupName": group_name,
                "subgroupCode": f"{fig_num:02d}",
                "illustrationCode": f"FIG{fig_num}",
                "title": diag_title,
                "subTitle": f"{model_name} - {diag_title}",
                "diagramType": f"{model_slug}_epc",
                "thumbnailUrl": f"/catalogos/{model_slug}/{image_filename}",
                "customImageUrl": f"/catalogos/{model_slug}/{image_filename}",
                "hotspots": hotspots,
                "parts": parts_list
            })

        var_name = slugify(f"{model_slug}_CONVERTED_DIAGRAMS").upper()
        file_name = f"{model_slug}CatalogData"
        ts_filepath = os.path.join(GENERATED_DATA_DIR, f"{file_name}.ts")

        ts_content = f"import {{ PartsDiagramGroup }} from '../../types';\n\n"
        ts_content += f"export const {var_name}: PartsDiagramGroup[] = "
        ts_content += json.dumps(converted_diagrams, indent=2, ensure_ascii=False)
        ts_content += ";\n"

        with open(ts_filepath, 'w', encoding='utf-8') as f:
            f.write(ts_content)

        diagrams_count = len(converted_diagrams)
        parts_count = sum(len(d['parts']) for d in converted_diagrams)
        print(f"    [✓] Catálogo gerado com sucesso: {ts_filepath} ({diagrams_count} diagramas, {parts_count} peças)")

        model_summary = {
            "id": f"{default_brand.lower()}-{model_slug}",
            "brand": default_brand,
            "name": model_name,
            "commercialName": f"{default_brand} {model_name}",
            "years": "2024 - 2027",
            "displacement": "150 cc",
            "category": "Street",
            "image": model_image_url,
            "diagramsCount": diagrams_count,
            "totalPartsCount": parts_count,
            "slug": model_slug,
            "var_name": var_name,
            "file_name": file_name
        }

        sync_model_to_mock_parts_models(model_summary)

        update_model_checkpoint(
            model_slug, default_brand, brand_name, model_name, "COMPLETED",
            stats={
                "diagrams_count": diagrams_count,
                "parts_count": parts_count,
                "file_name": file_name,
                "var_name": var_name
            }
        )

        return model_summary

    except Exception as e:
        err_msg = f"Exceção não tratada ao processar modelo: {e}"
        print(f"    [-] {err_msg}")
        update_model_checkpoint(model_slug, default_brand, brand_name, model_name, "FAILED", error=err_msg)
        return None

    finally:
        if ftp:
            try:
                ftp.quit()
            except Exception:
                pass
        if local_excel_path and os.path.exists(local_excel_path):
            try:
                os.remove(local_excel_path)
            except Exception:
                pass
        gc.collect()
        time.sleep(0.5)

def fetch_brand_model_names(server, user, pwd, brand_name):
    print(f"Listando modelos disponíveis para a marca {brand_name} no FTP...")
    ftp = None
    try:
        ftp = get_ftp_connection(server, user, pwd)
        ftp.cwd(f'/catalogos_autoware/{brand_name}')
        items = []
        ftp.retrlines('LIST', lambda l: items.append(l))
        model_dirs = []
        for line in items:
            if line.startswith('d'):
                parts = line.split(maxsplit=8)
                model_dirs.append(parts[-1])
        return model_dirs
    except Exception as e:
        print(f"[-] Erro ao listar diretórios de {brand_name}: {e}")
        return []
    finally:
        if ftp:
            try:
                ftp.quit()
            except Exception:
                pass

def main():
    print("==================================================")
    print(" INICIANDO INTEGRACAO SEQUENCIAL DOS CATALOGOS FTP")
    print("==================================================")

    # Parse CLI flags
    force_all = '--force' in sys.argv
    retry_failed = '--retry-failed' in sys.argv
    single_model_target = None
    if '--model' in sys.argv:
        try:
            idx = sys.argv.index('--model')
            single_model_target = sys.argv[idx + 1]
        except Exception:
            pass

    checkpoint = load_checkpoint()

    brands_config = [
        {'server': 'jtz-ftp.webnow.com.br', 'user': 'conexaojtz', 'pass': 'fai1ciPh', 'ftp_brand': 'JTZ', 'default_brand': 'Haojue'},
        {'server': 'jtz-ftp.webnow.com.br', 'user': 'conexaosuzuki', 'pass': 'fai1ciPh', 'ftp_brand': 'JTA', 'default_brand': 'Suzuki'}
    ]

    all_targets = []

    for cfg in brands_config:
        m_dirs = fetch_brand_model_names(cfg['server'], cfg['user'], cfg['pass'], cfg['ftp_brand'])
        for m_name in m_dirs:
            slug = slugify(f"{cfg['default_brand']}_{m_name}")
            all_targets.append({
                'cfg': cfg,
                'model_name': m_name,
                'slug': slug
            })

    total_models = len(all_targets)
    print(f"\nTotal de modelos encontrados no FTP: {total_models}")

    integrated_models = []
    failed_models = []

    for i, target in enumerate(all_targets, 1):
        slug = target['slug']
        cfg = target['cfg']
        m_name = target['model_name']

        if single_model_target:
            target_clean = single_model_target.lower().strip()
            if target_clean not in slug and target_clean not in m_name.lower():
                continue

        model_ckpt = checkpoint.get("models", {}).get(slug, {})
        status = model_ckpt.get("status")

        if status == "COMPLETED" and not force_all:
            print(f"[{i}/{total_models}] Pulando {m_name} (slug: {slug}) — já integrado com sucesso.")
            integrated_models.append(model_ckpt)
            continue

        if status == "FAILED" and not (retry_failed or force_all or single_model_target):
            print(f"[{i}/{total_models}] Pulando {m_name} (slug: {slug}) — marcou falha anteriormente (use --retry-failed para tentar de novo).")
            failed_models.append(model_ckpt)
            continue

        res = process_single_model(
            cfg['server'], cfg['user'], cfg['pass'],
            cfg['ftp_brand'], cfg['default_brand'],
            m_name, i, total_models
        )

        if res:
            integrated_models.append(res)
        else:
            ckpt_after = load_checkpoint().get("models", {}).get(slug, {})
            failed_models.append(ckpt_after)

    report = {
        "integrated_count": len(integrated_models),
        "failed_count": len(failed_models),
        "integrated_models": integrated_models,
        "failed_models": failed_models,
        "last_run": datetime.datetime.now().isoformat()
    }

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n==================================================")
    print(f" RESUMO DA INTEGRACAO")
    print(f"==================================================")
    print(f"Modelos integrados com sucesso: {len(integrated_models)}")
    print(f"Modelos com falha: {len(failed_models)}")
    print(f"Relatório salvo em: {REPORT_FILE}")
    print(f"Checkpoint atualizado em: {CHECKPOINT_FILE}")

if __name__ == '__main__':
    main()
