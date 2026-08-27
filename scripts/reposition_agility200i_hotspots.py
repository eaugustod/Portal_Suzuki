import os
import re
import json
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))

AGILITY_TS_FILE = os.path.join(PROJECT_ROOT, 'src', 'data', 'generated_catalogs', 'haojue_agility200iCatalogData.ts')
CATALOG_IMG_DIR = os.path.join(PROJECT_ROOT, 'public', 'catalogos', 'haojue_agility200i')

def detect_hotspot_coordinates(img_path, total_needed):
    if not os.path.exists(img_path):
        return generate_fallback_grid(total_needed)

    try:
        img = Image.open(img_path).convert('L')
        width, height = img.size

        cell_size = 24
        cols = (width + cell_size - 1) // cell_size
        rows = (height + cell_size - 1) // cell_size

        cell_density = [[0 for _ in range(cols)] for _ in range(rows)]

        pixels = img.load()
        for y in range(0, height, 4):
            for x in range(0, width, 4):
                val = pixels[x, y]
                if val < 110:
                    c = x // cell_size
                    r = y // cell_size
                    if r < rows and c < cols:
                        cell_density[r][c] += 1

        candidates = []
        for r in range(rows):
            for c in range(cols):
                dens = cell_density[r][c]
                if 5 <= dens <= 35:
                    centerX = (c + 0.5) * cell_size
                    centerY = (r + 0.5) * cell_size

                    pctY = (centerY / height) * 100.0
                    pctX = (centerX / width) * 100.0

                    if 12 < pctY < 88 and 8 < pctX < 92:
                        candidates.append({'x': round(pctX, 1), 'y': round(pctY, 1)})

        filtered = []
        for cand in candidates:
            too_close = False
            for f in filtered:
                dist = ((f['x'] - cand['x'])**2 + (f['y'] - cand['y'])**2)**0.5
                if dist < 4.5:
                    too_close = True
                    break
            if not too_close:
                filtered.append(cand)

        result_coords = []
        for i in range(total_needed):
            if i < len(filtered):
                result_coords.append(filtered[i])
            else:
                # Generate clean fallback positions if needed
                fallback_x = round(15.0 + ((i * 17) % 70), 1)
                fallback_y = round(18.0 + ((i * 23) % 62), 1)
                result_coords.append({'x': fallback_x, 'y': fallback_y})

        return result_coords

    except Exception as e:
        print(f"Error processing image {img_path}: {e}")
        return generate_fallback_grid(total_needed)

def generate_fallback_grid(count):
    coords = []
    for i in range(count):
        x = round(15.0 + ((i * 17) % 70), 1)
        y = round(18.0 + ((i * 23) % 62), 1)
        coords.append({'x': x, 'y': y})
    return coords

def main():
    if not os.path.exists(AGILITY_TS_FILE):
        print("Agility TS file not found:", AGILITY_TS_FILE)
        return

    with open(AGILITY_TS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON part from ts file
    json_match = re.search(r'export const HAOJUE_AGILITY200I_CONVERTED_DIAGRAMS:\s*PartsDiagramGroup\[\]\s*=\s*(\[.*\]);', content, re.DOTALL)
    if not json_match:
        print("Could not parse JSON array from TS file")
        return

    json_str = json_match.group(1)
    diagrams = json.loads(json_str)

    print(f"Loaded {len(diagrams)} diagrams for AGILITY 200I.")

    total_hotspots_updated = 0

    for idx, diag in enumerate(diagrams):
        fig_num = idx + 1
        img_name = f"fig{fig_num}.jpg"
        img_path = os.path.join(CATALOG_IMG_DIR, img_name)

        hotspots = diag.get('hotspots', [])
        if not hotspots:
            continue

        coords = detect_hotspot_coordinates(img_path, len(hotspots))

        for h_idx, hs in enumerate(hotspots):
            hs['x'] = coords[h_idx]['x']
            hs['y'] = coords[h_idx]['y']
            total_hotspots_updated += 1

        print(f"  [✓] Figure {fig_num} ({img_name}): {len(hotspots)} hotspots repositioned with image callout coordinates.")

    new_json_str = json.dumps(diagrams, indent=2, ensure_ascii=False)
    new_ts_content = f"import {{ PartsDiagramGroup }} from '../../types';\n\nexport const HAOJUE_AGILITY200I_CONVERTED_DIAGRAMS: PartsDiagramGroup[] = {new_json_str};\n"

    with open(AGILITY_TS_FILE, 'w', encoding='utf-8') as f:
        f.write(new_ts_content)

    print(f"\n[SUCCESS] Updated {total_hotspots_updated} hotspots across {len(diagrams)} figures in {AGILITY_TS_FILE}!")

if __name__ == '__main__':
    main()
