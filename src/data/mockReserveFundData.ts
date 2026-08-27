import { ReserveFundTransaction, BrandType } from '../types';

export const INITIAL_RESERVE_FUND_TRANSACTIONS: ReserveFundTransaction[] = [
  // MotoSul Moema SP (motosul)
  {
    id: 'rf-c01',
    dealershipId: 'motosul',
    dealershipName: 'MotoSul Moema SP',
    type: 'credito',
    date: '08/11/2025',
    reference: 'EMPLACAMENTO GRÁTIS',
    modelName: 'CHOPPER RH',
    chassi: '102605',
    amount: 500.00,
    status: 'aprovado',
    brand: 'Haojue',
    financialApproved: true,
    observation: 'Bônus de emplacamento concedido comercial'
  },
  {
    id: 'rf-c02',
    dealershipId: 'motosul',
    dealershipName: 'MotoSul Moema SP',
    type: 'credito',
    date: '08/11/2025',
    reference: 'EMPLACAMENTO GRÁTIS',
    modelName: 'CHOPPER RH',
    chassi: '102708',
    amount: 500.00,
    status: 'aprovado',
    brand: 'Haojue',
    financialApproved: true,
    observation: 'Bônus de emplacamento concedido comercial'
  },
  {
    id: 'rf-c04',
    dealershipId: 'motosul',
    dealershipName: 'MotoSul Moema SP',
    type: 'credito',
    date: '22/11/2025',
    reference: 'EMPLACAMENTO + RESTITUIÇÃO',
    modelName: 'GSX-8S',
    chassi: '102719',
    amount: 1329.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Restituição direta comercial Suzuki'
  },
  {
    id: 'rf-c05',
    dealershipId: 'motosul',
    dealershipName: 'MotoSul Moema SP',
    type: 'credito',
    date: '05/01/2026',
    reference: 'APORTA RD STATION / MARKETING',
    modelName: 'V-STROM 800DE',
    amount: 3500.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Inclusão Marketing RD Station aprovada pelo financeiro'
  },
  {
    id: 'rf-d01',
    dealershipId: 'motosul',
    dealershipName: 'MotoSul Moema SP',
    type: 'debito',
    date: '08/11/2025',
    reference: 'DESCONTO EM PEDIDO DE MOTO',
    orderId: 'L0017P',
    amount: 2000.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Utilizado no pedido L0017P'
  },

  // Nova Motor Campinas (novamotor)
  {
    id: 'rf-c03',
    dealershipId: 'novamotor',
    dealershipName: 'Nova Motor Campinas',
    type: 'credito',
    date: '08/11/2025',
    reference: 'EMPLACAMENTO GRÁTIS',
    modelName: 'DK150',
    chassi: '714191',
    amount: 500.00,
    status: 'aprovado',
    brand: 'Haojue',
    financialApproved: true,
    observation: 'Crédito de campanha de vendas'
  },
  {
    id: 'rf-c06',
    dealershipId: 'novamotor',
    dealershipName: 'Nova Motor Campinas',
    type: 'credito',
    date: '10/02/2026',
    reference: 'CAMPANHA ZONTES SCOOTER',
    modelName: '350E',
    amount: 2000.00,
    status: 'aprovado',
    brand: 'Zontes',
    financialApproved: true,
    observation: 'Aporte de marca Zontes'
  },
  {
    id: 'rf-d02',
    dealershipId: 'novamotor',
    dealershipName: 'Nova Motor Campinas',
    type: 'debito',
    date: '28/11/2025',
    reference: 'ABATIMENTO DE FATURA',
    orderId: 'L0019G',
    amount: 1200.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Abatimento aprovado financeiro'
  },

  // Rio Motos Barra RJ (riomotos)
  {
    id: 'rf-c07',
    dealershipId: 'riomotos',
    dealershipName: 'Rio Motos Barra RJ',
    type: 'credito',
    date: '15/01/2026',
    reference: 'APORTA MKT REGIONAL RJ',
    amount: 5000.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Aporte especial para feira de motos RJ'
  },
  {
    id: 'rf-d03',
    dealershipId: 'riomotos',
    dealershipName: 'Rio Motos Barra RJ',
    type: 'debito',
    date: '15/01/2026',
    reference: 'INTEGRAÇÃO WEB MOTORS / MKT',
    amount: 199.00,
    status: 'aprovado',
    brand: 'Haojue',
    financialApproved: true,
    observation: 'Débitos de campanha digital'
  },

  // Savassi Motos BH (savassi)
  {
    id: 'rf-c08',
    dealershipId: 'savassi',
    dealershipName: 'Savassi Motos BH',
    type: 'credito',
    date: '20/01/2026',
    reference: 'BÔNUS COMERCIAL MONTADORA',
    modelName: 'HAYABUSA',
    amount: 4500.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Premiação de meta atingida Q4'
  },
  {
    id: 'rf-d04',
    dealershipId: 'savassi',
    dealershipName: 'Savassi Motos BH',
    type: 'debito',
    date: '02/02/2026',
    reference: 'DESCONTO EM PEDIDO DE MOTO',
    orderId: 'PED-BH-88',
    amount: 1500.00,
    status: 'aprovado',
    brand: 'Suzuki',
    financialApproved: true,
    observation: 'Abatimento em pedido de showroom'
  }
];

export const INITIAL_BRAND_RESERVE_LIMITS: Record<BrandType, number> = {
  Suzuki: 15000.00,
  Haojue: 8000.00,
  Zontes: 10000.00,
  Hisun: 5000.00,
  Kymco: 7500.00,
  Quadriciclos: 4000.00
};
