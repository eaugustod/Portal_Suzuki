import { BrandRegional } from '../types';

export const INITIAL_BRAND_REGIONALS: BrandRegional[] = [
  {
    id: 'reg-suz-sp',
    name: 'Regional SP & Capital',
    brand: 'Suzuki',
    regionalManager: 'Carlos Eduardo Silva',
    email: 'carlos.silva@suzukimotos.com.br',
    phone: '(11) 98765-4321',
    statesCovered: ['SP'],
    dealershipCount: 14
  },
  {
    id: 'reg-suz-sul',
    name: 'Regional Sul (PR, SC, RS)',
    brand: 'Suzuki',
    regionalManager: 'Roberto Alencar',
    email: 'roberto.alencar@suzukimotos.com.br',
    phone: '(41) 99887-1122',
    statesCovered: ['PR', 'SC', 'RS'],
    dealershipCount: 18
  },
  {
    id: 'reg-suz-ne',
    name: 'Regional Norte & Nordeste',
    brand: 'Suzuki',
    regionalManager: 'Mariana Fontes',
    email: 'mariana.fontes@suzukimotos.com.br',
    phone: '(71) 99123-8899',
    statesCovered: ['BA', 'PE', 'CE', 'AM', 'PA'],
    dealershipCount: 12
  },
  {
    id: 'reg-haojue-se',
    name: 'Regional Haojue Sudeste',
    brand: 'Haojue',
    regionalManager: 'Fernando Vasconcelos',
    email: 'fernando.vasconcelos@haojuemotos.com.br',
    phone: '(11) 97112-4455',
    statesCovered: ['SP', 'RJ', 'MG', 'ES'],
    dealershipCount: 22
  },
  {
    id: 'reg-zontes-br',
    name: 'Regional Zontes Brasil',
    brand: 'Zontes',
    regionalManager: 'Alexandre Magno',
    email: 'alexandre.magno@zontesmotos.com.br',
    phone: '(11) 98877-3344',
    statesCovered: ['SP', 'RJ', 'PR', 'SC', 'RS', 'DF', 'GO'],
    dealershipCount: 15
  }
];
