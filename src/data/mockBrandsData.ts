import { Brand } from '../types';

// Lista padrão de nomes de marcas ativas (fallback / fonte de verdade do front)
export const DEFAULT_BRAND_NAMES: string[] = [
  'Suzuki', 'Haojue', 'Zontes', 'Hisun', 'Kymco', 'Quadriciclos'
];

// Retorna os nomes das marcas (usado em filtros/tabs de todo o projeto).
// Se brands (do cadastro) for informado, prioriza as marcas ativas cadastradas.
export const getActiveBrandNames = (brands?: Brand[] | null): string[] => {
  if (brands && Array.isArray(brands) && brands.length > 0) {
    const active = brands.filter(b => b.ativo).map(b => b.nome);
    if (active.length > 0) return active;
  }
  return DEFAULT_BRAND_NAMES;
};

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-suzuki',
    nome: 'Suzuki',
    codigo: 'SUZ',
    razaoSocial: 'J. Toledo Suzuki Motos do Brasil Ltda.',
    cnpj: '61.123.456/0001-90',
    corPrimaria: '#00428c',
    corSecundaria: '#e11d48',
    logoUrl: '/suzuki-logo.png',
    siteOficial: 'https://suzukimotos.com.br',
    descricao: 'Motocicletas de alta performance esportiva, tecnologia japonesa de ponta e tradição global.',
    paisOrigem: 'Japão',
    ativo: true,
    ordemExibicao: 1,
    modelsCount: 18,
    dealersCount: 12
  },
  {
    id: 'brand-haojue',
    nome: 'Haojue',
    codigo: 'HAO',
    razaoSocial: 'JTZ Indústria e Comércio de Motocicletas Ltda.',
    cnpj: '17.382.491/0001-33',
    corPrimaria: '#dc2626',
    corSecundaria: '#171717',
    logoUrl: '',
    siteOficial: 'https://haojuemotos.com.br',
    descricao: 'Líder em motocicletas urbanas utilitárias, baixa e média cilindrada com economia, robustez e conforto.',
    paisOrigem: 'China',
    ativo: true,
    ordemExibicao: 2,
    modelsCount: 8,
    dealersCount: 11
  },
  {
    id: 'brand-zontes',
    nome: 'Zontes',
    codigo: 'ZON',
    razaoSocial: 'JTZ Indústria e Comércio de Motocicletas Ltda.',
    cnpj: '17.382.491/0001-33',
    corPrimaria: '#d97706',
    corSecundaria: '#1e293b',
    logoUrl: '',
    siteOficial: 'https://zontesmotos.com.br',
    descricao: 'Design futurista e arrojado, eletrônica de última geração, scooters executivas e motos premium.',
    paisOrigem: 'China',
    ativo: true,
    ordemExibicao: 3,
    modelsCount: 6,
    dealersCount: 9
  },
  {
    id: 'brand-kymco',
    nome: 'Kymco',
    codigo: 'KYM',
    razaoSocial: 'JTZ Indústria e Comércio de Motocicletas Ltda.',
    cnpj: '17.382.491/0001-33',
    corPrimaria: '#ea580c',
    corSecundaria: '#0f172a',
    logoUrl: '',
    siteOficial: 'https://kymcomotos.com.br',
    descricao: 'Referência global consolidada em maxi-scooters premium de alta cilindrada e conforto urbano.',
    paisOrigem: 'Taiwan',
    ativo: true,
    ordemExibicao: 4,
    modelsCount: 4,
    dealersCount: 8
  },
  {
    id: 'brand-hisun',
    nome: 'Hisun',
    codigo: 'HIS',
    razaoSocial: 'JTZ Indústria e Comércio de Motocicletas Ltda.',
    cnpj: '17.382.491/0001-33',
    corPrimaria: '#16a34a',
    corSecundaria: '#14532d',
    logoUrl: '',
    siteOficial: 'https://hisunmotors.com.br',
    descricao: 'Veículos utilitários off-road de alta resistência, ATVs e UTVs para agronegócio e aventura.',
    paisOrigem: 'Estados Unidos / China',
    ativo: true,
    ordemExibicao: 5,
    modelsCount: 4,
    dealersCount: 5
  },
  {
    id: 'brand-quadriciclos',
    nome: 'Quadriciclos',
    codigo: 'QUA',
    razaoSocial: 'J. Toledo Distribuidora de Veículos Especiais Ltda.',
    cnpj: '61.123.456/0002-71',
    corPrimaria: '#9333ea',
    corSecundaria: '#581c87',
    logoUrl: '',
    siteOficial: 'https://suzukimotos.com.br/quadriciclos',
    descricao: 'Linha completa e versátil de quadriciclos recreativos e esportivos para lazer e trabalho no campo.',
    paisOrigem: 'Brasil / Japão',
    ativo: true,
    ordemExibicao: 6,
    modelsCount: 3,
    dealersCount: 4
  }
];
