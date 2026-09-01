import { PurchaseModel } from '../types';
import { MOCK_PARTS_MODELS } from './mockPartsData';

// Map all 33 models across Suzuki, Haojue, Zontes, Hisun, Kymco directly from the official showroom data
export const INITIAL_MODELS_CATALOG: PurchaseModel[] = MOCK_PARTS_MODELS.map((pModel) => {
  const ppsPrice = pModel.startingPrice || 35000;
  // Factory cost is typically ~80% of MSRP
  const cost = Math.round(ppsPrice * 0.8);

  return {
    id: pModel.id,
    brand: (pModel.brand === 'Hisun' ? 'Hisun' : pModel.brand) as any,
    modelName: pModel.name,
    yearModel: '2026/2026',
    category: pModel.category,
    storeStock: 2,
    avgRegistration: '3 / mês',
    monthlyPurchase: 2,
    commitmentMonth3: 2,
    factoryCost: cost,
    ppsMSRP: ppsPrice,
    selectedOrderType: 'Compra',
    selectedPayment: 'A Prazo',
    officialWebUrl: pModel.brand === 'Suzuki' 
      ? `https://suzukimotos.com.br/` 
      : pModel.brand === 'Haojue' 
      ? `https://haojuemotos.com.br/` 
      : pModel.brand === 'Zontes' 
      ? `https://zontesmotos.com.br/` 
      : pModel.brand === 'Hisun'
      ? `https://hisunmotors.com.br/`
      : `https://kymcomotos.com.br/`,
    image: pModel.image,
    description: `${pModel.commercialName}. ${pModel.engineType}. Modelo oficial homologado pelo Grupo J. Toledo / JTZ Motors Brasil.`,
    performanceSummary: `Equipada com motor ${pModel.displacement} (${pModel.engineType}). Alta performance e confiabilidade com garantia de fábrica.`,
    features: [
      'Garantia oficial de fábrica Grupo J. Toledo / JTZ Motors',
      'Injeção Eletrônica / Ciclística avançada homologada',
      'Painel de instrumentos completo com tecnologia de bordo',
      'Freios de alta performance com sistema ABS/CBS',
      'Iluminação Full LED e design aerodinâmico'
    ],
    technicalSpecs: {
      engineType: pModel.engineType,
      displacement: pModel.displacement,
      power: pModel.engineType.includes('cv') ? pModel.engineType.split('cv')[0].split(',').pop()?.trim() + ' cv' : 'Consulte',
      torque: 'Consulte Ficha',
      fuelSystem: 'Injeção Eletrônica Inteligente',
      transmission: pModel.category.includes('Scooter') || pModel.category.includes('ATV') ? 'Automática CVT' : '6 velocidades',
      frontSuspension: 'Garfo telescópico hidráulico',
      rearSuspension: 'Balança articulada com monoamortecedor',
      frontBrake: 'Disco ventilado com ABS/CBS',
      rearBrake: 'Disco simples com ABS/CBS',
      frontTire: 'Pneu Radial / Tubeless',
      rearTire: 'Pneu Radial / Tubeless',
      fuelTank: 'Capacidade oficial',
      curbWeight: 'Consulte Ficha',
      seatHeight: 'Ergonomia balanceada',
      topSpeed: 'Velocidade homologada',
      acceleration0to100: 'Alta aceleração',
      avgConsumption: 'Excelente eficiência energética'
    },
    variants: [
      {
        id: `${pModel.id}-cor-1`,
        colorName: 'Azul Metálico / Cor Oficial',
        colorCode: 'YSF 4A',
        colorHex: pModel.brand === 'Suzuki' ? '#1d4ed8' : pModel.brand === 'Haojue' ? '#b91c1c' : pModel.brand === 'Zontes' ? '#d97706' : pModel.brand === 'Hisun' ? '#15803d' : '#2563eb',
        imageUrl: pModel.image,
        stockStatus: 'disponivel',
        quantity: 0
      },
      {
        id: `${pModel.id}-cor-2`,
        colorName: 'Preto Glass Sparkle',
        colorCode: 'YVB 2B',
        colorHex: '#18181b',
        imageUrl: pModel.image,
        stockStatus: 'poucas_unidades',
        quantity: 0
      },
      {
        id: `${pModel.id}-cor-3`,
        colorName: 'Vermelho / Edição Especial',
        colorCode: 'RED 01',
        colorHex: '#dc2626',
        imageUrl: pModel.image,
        stockStatus: 'indisponivel',
        quantity: 0
      }
    ]
  };
});
