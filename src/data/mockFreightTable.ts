import { FreightRateEntry } from '../types';

export const INITIAL_FREIGHT_TABLE: FreightRateEntry[] = [
  // Sul / Sudeste (exceto ES) -> Empresa 13 Armazém (Jundiaí / SP)
  { id: 'frt-sp', state: 'SP', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 650, estimatedDays: 2 },
  { id: 'frt-rj', state: 'RJ', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 820, estimatedDays: 3 },
  { id: 'frt-mg', state: 'MG', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 890, estimatedDays: 3 },
  { id: 'frt-pr', state: 'PR', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 780, estimatedDays: 3 },
  { id: 'frt-sc', state: 'SC', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 850, estimatedDays: 4 },
  { id: 'frt-rs', state: 'RS', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 980, estimatedDays: 4 },

  // Norte, Nordeste, Centro-Oeste e ES -> Manaus Local de Estoque 16 (Empresa 01/10)
  { id: 'frt-es', state: 'ES', region: 'Sudeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1250, estimatedDays: 6 },
  { id: 'frt-df', state: 'DF', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1100, estimatedDays: 5 },
  { id: 'frt-go', state: 'GO', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1150, estimatedDays: 5 },
  { id: 'frt-mt', state: 'MT', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1280, estimatedDays: 6 },
  { id: 'frt-ms', state: 'MS', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1220, estimatedDays: 6 },
  { id: 'frt-ba', state: 'BA', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1350, estimatedDays: 7 },
  { id: 'frt-pe', state: 'PE', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1420, estimatedDays: 7 },
  { id: 'frt-ce', state: 'CE', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1450, estimatedDays: 8 },
  { id: 'frt-am', state: 'AM', region: 'Norte', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 450, estimatedDays: 1 },
  { id: 'frt-pa', state: 'PA', region: 'Norte', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 980, estimatedDays: 4 }
];

export function getAutomaticWarehouseOrigin(state: string): { originWarehouse: 'empresa_13_armazem' | 'manaus_le_16'; label: string } {
  const southOrSoutheastExceptEs = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'];
  if (southOrSoutheastExceptEs.includes(state.toUpperCase())) {
    return { originWarehouse: 'empresa_13_armazem', label: 'Empresa 13 - Armazém (SP)' };
  }
  return { originWarehouse: 'manaus_le_16', label: 'Manaus Local de Estoque 16 (Empresa 01 / 10)' };
}

export function calculateAutomaticFreight(state: string): number {
  const entry = INITIAL_FREIGHT_TABLE.find(f => f.state.toUpperCase() === state.toUpperCase());
  if (entry) return entry.costPerUnit;
  // Default fallback if UF not in table
  const origin = getAutomaticWarehouseOrigin(state);
  return origin.originWarehouse === 'empresa_13_armazem' ? 850 : 1300;
}
