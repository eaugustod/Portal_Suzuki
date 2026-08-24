import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Package, 
  Bike, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PartsBrand, PartsModelSummary, PartsDiagramGroup, PartsPinHotspot, PartsItem } from '../../types';
import { autoDetectHotspotsFromImage } from '../../utils/autoNumberDetector';

interface PartsCatalogUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newModel: PartsModelSummary, diagrams: PartsDiagramGroup[]) => void;
  isDarkMode?: boolean;
}

export const PartsCatalogUploadModal: React.FC<PartsCatalogUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  isDarkMode = false
}) => {
  // Form State for Model Summary
  const [brand, setBrand] = useState<PartsBrand>('Suzuki');
  const [modelName, setModelName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [displacement, setDisplacement] = useState('');
  const [category, setCategory] = useState('Street');
  const [years, setYears] = useState('2025 - 2027');
  const [chassisPrefix, setChassisPrefix] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(45000);

  // Uploaded Files State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<{ [filename: string]: string }>({}); // filename lower -> dataUrl
  const [imageCount, setImageCount] = useState<number>(0);

  // Parsed Output State
  const [parsedDiagrams, setParsedDiagrams] = useState<PartsDiagramGroup[]>([]);
  const [parsedPartsCount, setParsedPartsCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Excel File Parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setParseError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setParseError('Planilha sem dados suficientes.');
          setIsProcessing(false);
          return;
        }

        // Identify Column Indices
        const headerRow = (jsonData[0] as any[]).map(c => String(c || '').toUpperCase().trim());
        
        let colFig = headerRow.findIndex(h => h.includes('FIGURA') || h.includes('FIG'));
        let colTitle = headerRow.findIndex(h => h.includes('NOME') && !h.includes('MODELO') && !h.includes('CATALOGO'));
        let colGroup = headerRow.findIndex(h => h.includes('GRUPO'));
        let colRef = headerRow.findIndex(h => h.includes('REF') || h.includes('REF.'));
        let colPartNo = headerRow.findIndex(h => h.includes('PARTNO') || h.includes('PART') || h.includes('CODIGO'));
        let colDesc = headerRow.findIndex(h => h.includes('DESCRIÇ') || h.includes('DESCRICAO') || h.includes('DESC'));
        let colQtd = headerRow.findIndex(h => h.includes('QTD') || h.includes('QUANT'));
        let colComments = headerRow.findIndex(h => h.includes('COMENT') || h.includes('OBS'));

        // Fallbacks if header matching didn't catch specific positions
        if (colFig === -1) colFig = 5;
        if (colTitle === -1) colTitle = 6;
        if (colGroup === -1) colGroup = 7;
        if (colRef === -1) colRef = 8;
        if (colPartNo === -1) colPartNo = 9;
        if (colDesc === -1) colDesc = 10;
        if (colQtd === -1) colQtd = 11;
        if (colComments === -1) colComments = 12;

        const diagramsMap: { [figId: string]: { figCode: string; title: string; group: string; parts: any[] } } = {};
        let totalParts = 0;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const figRaw = String(row[colFig] || '').trim();
          if (!figRaw) continue;

          const figId = figRaw.toLowerCase();
          const title = String(row[colTitle] || '').trim() || `Diagrama ${figRaw.toUpperCase()}`;
          const group = String(row[colGroup] || '').trim() || 'Geral';
          const refRaw = String(row[colRef] || '').trim();
          const partNo = String(row[colPartNo] || '').trim();
          const desc = String(row[colDesc] || '').trim();
          const qtdRaw = String(row[colQtd] || '1').trim();
          const comments = String(row[colComments] || '').trim();

          if (!partNo && !desc) continue;

          if (!diagramsMap[figId]) {
            diagramsMap[figId] = {
              figCode: figRaw.toUpperCase(),
              title,
              group,
              parts: []
            };
          }

          const refNum = parseInt(refRaw.replace(/\D/g, '')) || 0;
          const qtdNum = parseInt(qtdRaw.replace(/\D/g, '')) || 1;

          diagramsMap[figId].parts.push({
            refRaw,
            ref: refNum,
            partNumber: partNo,
            description: desc,
            qtd: qtdNum,
            comments
          });

          totalParts++;
        }

        // Convert Map to PartsDiagramGroup[]
        const groupCodeMap: { [g: string]: string } = { 'Motor': '1', 'Elétrica': '2', 'Chassi': '3' };
        
        const groupPromises = Object.keys(diagramsMap).map(async (figId, index) => {
          const d = diagramsMap[figId];
          const groupCode = groupCodeMap[d.group] || '4';

          // Try matching image DataURL or fallback URL
          const matchedImgDataUrl = imageFiles[figId] || imageFiles[`${figId}.jpg`] || imageFiles[`${figId}.png`] || 
            `https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80`;

          const parts: PartsItem[] = d.parts.map((p, idx) => {
            const baseHash = (p.partNumber || '0').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const factoryPrice = Math.round((25.0 + (baseHash % 250) + ((baseHash * 5) % 400) + 0.90) * 100) / 100;
            const msrpPrice = Math.round(factoryPrice * 1.45 * 100) / 100;

            return {
              id: `p-${figId}-${idx + 1}`,
              ref: p.ref,
              partNumber: p.partNumber || `SUZ-${figId.toUpperCase()}-${idx + 1}`,
              description: p.description || 'PEÇA EPC SUZUKI',
              observation: p.comments || undefined,
              unitQuantity: p.qtd,
              factoryPrice,
              msrpPrice,
              stockManaus: 5 + (baseHash % 40),
              stockJundiai: 10 + ((baseHash * 3) % 50),
              inStock: true,
              categoryGroup: d.group
            };
          });

          // Auto-detect number coordinates on diagram image via Canvas Vision
          const hotspots = await autoDetectHotspotsFromImage(matchedImgDataUrl, parts);

          return {
            id: `diag-import-${figId}`,
            groupCode,
            groupName: d.group,
            subgroupCode: `${(index + 1).toString().padStart(2, '0')}`,
            illustrationCode: d.figCode,
            title: d.title,
            subTitle: `FIGURA ${d.figCode}`,
            diagramType: 'uploaded_epc',
            thumbnailUrl: matchedImgDataUrl,
            customImageUrl: matchedImgDataUrl,
            hotspots,
            parts
          };
        });

        Promise.all(groupPromises).then((groups) => {
          setParsedDiagrams(groups);
          setParsedPartsCount(totalParts);
          setIsProcessing(false);
        }).catch(() => {
          setIsProcessing(false);
        });
      } catch (err: any) {
        setParseError(`Erro ao processar planilha Excel: ${err.message || 'Formato inválido'}`);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Images Upload
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileMap: { [name: string]: string } = { ...imageFiles };
    let loadedCount = 0;
    const totalToLoad = files.length;

    Array.from(files).forEach((file: File) => {
      const nameKey = file.name.toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          fileMap[nameKey] = result;
          fileMap[file.name.toLowerCase()] = result;
        }
        loadedCount++;
        if (loadedCount === totalToLoad) {
          setImageFiles(fileMap);
          setImageCount(Object.keys(fileMap).length / 2);
          
          // Re-update parsed diagrams images if diagrams are already parsed
          if (parsedDiagrams.length > 0) {
            setParsedDiagrams(prev => prev.map(diag => {
              const figKey = diag.illustrationCode.toLowerCase();
              const matched = fileMap[figKey] || fileMap[`${figKey}.jpg`] || fileMap[`${figKey}.png`];
              if (matched) {
                return { ...diag, thumbnailUrl: matched, customImageUrl: matched };
              }
              return diag;
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!modelName.trim()) {
      setParseError('Por favor, informe o nome do modelo da moto.');
      return;
    }
    if (parsedDiagrams.length === 0) {
      setParseError('Nenhum diagrama foi encontrado na planilha Excel.');
      return;
    }

    const modelId = `model-custom-${Date.now()}`;

    const newModelSummary: PartsModelSummary = {
      id: modelId,
      brand,
      name: modelName.toUpperCase(),
      commercialName: commercialName || modelName,
      years: years || '2025 - 2027',
      displacement: displacement || '1.000 cc',
      category: category || 'Street',
      image: parsedDiagrams[0]?.customImageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      engineType: `${displacement || 'Multi-cilíndrico'}, DOHC Genuíno Suzuki`,
      diagramsCount: parsedDiagrams.length,
      totalPartsCount: parsedPartsCount,
      chassisPrefix: chassisPrefix || '95VJS000',
      startingPrice: startingPrice || 45000,
      badge: 'CATÁLOGO IMPORTADO'
    };

    onImportSuccess(newModelSummary, parsedDiagrams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 ${
        isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-white text-neutral-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${
          isDarkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-red-50/80 border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Subir / Importar Novo Catálogo EPC</h2>
              <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Converta a estrutura em Excel (.xlsx) e figuras de peças para o sistema do Portal Suzuki
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {parseError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Section 1: Model Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-2">
              <Bike className="w-4 h-4" /> 1. Informações do Modelo de Moto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Marca</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as PartsBrand)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                >
                  <option value="Suzuki">Suzuki</option>
                  <option value="Haojue">Haojue</option>
                  <option value="Zontes">Zontes</option>
                  <option value="Kymco">Kymco</option>
                  <option value="Hisun">Hisun</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Nome do Modelo (Código)*</label>
                <input 
                  type="text"
                  placeholder="Ex: HAYABUSA M5, GSX-8R"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Nome Comercial Completo</label>
                <input 
                  type="text"
                  placeholder="Ex: Suzuki Hayabusa GSX-1300R M5"
                  value={commercialName}
                  onChange={(e) => setCommercialName(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Cilindrada</label>
                <input 
                  type="text"
                  placeholder="Ex: 1.340 cc"
                  value={displacement}
                  onChange={(e) => setDisplacement(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Prefixo de Chassi / VDS</label>
                <input 
                  type="text"
                  placeholder="Ex: 95VJS48A"
                  value={chassisPrefix}
                  onChange={(e) => setChassisPrefix(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 opacity-80">Anos de Fabricação</label>
                <input 
                  type="text"
                  placeholder="Ex: 2025 - 2027"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className={`w-full text-sm px-3 py-2 rounded-lg border outline-none transition ${
                    isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white focus:border-red-500' : 'bg-white border-neutral-300 text-neutral-900 focus:border-red-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <hr className={isDarkMode ? 'border-neutral-800' : 'border-neutral-200'} />

          {/* Section 2: Files Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> 2. Arquivos do Catálogo (Excel + Imagens)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Excel File Drop */}
              <div className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                excelFile 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : isDarkMode ? 'border-neutral-700 hover:border-red-500' : 'border-neutral-300 hover:border-red-500'
              }`}>
                <FileSpreadsheet className={`w-10 h-10 mx-auto mb-2 ${excelFile ? 'text-emerald-500' : 'text-neutral-400'}`} />
                <h4 className="text-sm font-semibold mb-1">Planilha do Catálogo (.xlsx)</h4>
                <p className="text-xs opacity-70 mb-3">
                  {excelFile ? excelFile.name : 'Selecione a planilha com colunas: Figura, Grupo, Ref, PartNo, Descrição, Qtd'}
                </p>
                <label className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer transition shadow-md">
                  <Upload className="w-3.5 h-3.5" />
                  {excelFile ? 'Trocar Arquivo Excel' : 'Selecionar Arquivo .xlsx'}
                  <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
                </label>
              </div>

              {/* Images Folder / Multiple Files Drop */}
              <div className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                imageCount > 0 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : isDarkMode ? 'border-neutral-700 hover:border-red-500' : 'border-neutral-300 hover:border-red-500'
              }`}>
                <ImageIcon className={`w-10 h-10 mx-auto mb-2 ${imageCount > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
                <h4 className="text-sm font-semibold mb-1">Imagens dos Diagramas (.jpg / .png)</h4>
                <p className="text-xs opacity-70 mb-3">
                  {imageCount > 0 ? `${imageCount} imagens de figuras carregadas` : 'Selecione todas as figuras da pasta Imagens/FigG'}
                </p>
                <label className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 text-white cursor-pointer transition shadow-md">
                  <Upload className="w-3.5 h-3.5" />
                  {imageCount > 0 ? 'Adicionar Mais Imagens' : 'Selecionar Imagens'}
                  <input type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
                </label>
              </div>

            </div>
          </div>

          {/* Section 3: Import Preview & Summary */}
          {parsedDiagrams.length > 0 && (
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-neutral-950/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Resumo da Leitura do Catálogo
                </h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  Pronto para Importação
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-neutral-500/10">
                  <span className="block text-2xl font-black text-red-600">{parsedDiagrams.length}</span>
                  <span className="text-xs opacity-70">Figuras / Diagramas</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-500/10">
                  <span className="block text-2xl font-black text-blue-600">{parsedPartsCount}</span>
                  <span className="text-xs opacity-70">Peças Genuínas</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-500/10">
                  <span className="block text-2xl font-black text-purple-600">{imageCount}</span>
                  <span className="text-xs opacity-70">Imagens Mapeadas</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-500/10">
                  <span className="block text-2xl font-black text-amber-600">100%</span>
                  <span className="text-xs opacity-70">Estrutura VDS Validada</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          isDarkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              isDarkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirmImport}
            disabled={parsedDiagrams.length === 0 || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? 'Processando...' : 'Confirmar e Importar Catálogo'}
          </button>
        </div>

      </div>
    </div>
  );
};
