import { FreightRateEntry } from '../types';

export const INITIAL_FREIGHT_TABLE: FreightRateEntry[] = [
  // Sul / Sudeste (exceto ES) -> Empresa 13 Armazém (Jundiaí / SP)
  { id: 'frt-sp-cap', state: 'SP', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 650, estimatedDays: 2, locationType: 'capital' },
  { id: 'frt-sp-int', state: 'SP', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 720, estimatedDays: 3, locationType: 'interior' },
  { id: 'frt-rj-cap', state: 'RJ', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 820, estimatedDays: 3, locationType: 'capital' },
  { id: 'frt-rj-int', state: 'RJ', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 910, estimatedDays: 4, locationType: 'interior' },
  { id: 'frt-mg-cap', state: 'MG', region: 'Sudeste', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 890, estimatedDays: 3, locationType: 'capital' },
  { id: 'frt-pr-cap', state: 'PR', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 780, estimatedDays: 3, locationType: 'capital' },
  { id: 'frt-sc-cap', state: 'SC', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 850, estimatedDays: 4, locationType: 'capital' },
  { id: 'frt-rs-cap', state: 'RS', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 980, estimatedDays: 4, locationType: 'capital' },
  { id: 'frt-rs-int', state: 'RS', region: 'Sul', originWarehouse: 'empresa_13_armazem', originWarehouseLabel: 'Empresa 13 - Armazém (SP)', costPerUnit: 1090, estimatedDays: 5, locationType: 'interior' },

  // Norte, Nordeste, Centro-Oeste e ES -> Manaus Local de Estoque 16 (Empresa 01/10)
  { id: 'frt-es-cap', state: 'ES', region: 'Sudeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1250, estimatedDays: 6, locationType: 'capital' },
  { id: 'frt-df-cap', state: 'DF', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1100, estimatedDays: 5, locationType: 'capital' },
  { id: 'frt-go-cap', state: 'GO', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1150, estimatedDays: 5, locationType: 'capital' },
  { id: 'frt-mt-cap', state: 'MT', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1280, estimatedDays: 6, locationType: 'capital' },
  { id: 'frt-ms-cap', state: 'MS', region: 'Centro-Oeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1220, estimatedDays: 6, locationType: 'capital' },
  { id: 'frt-ba-cap', state: 'BA', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1350, estimatedDays: 7, locationType: 'capital' },
  { id: 'frt-pe-cap', state: 'PE', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1420, estimatedDays: 7, locationType: 'capital' },
  { id: 'frt-ce-cap', state: 'CE', region: 'Nordeste', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 1450, estimatedDays: 8, locationType: 'capital' },
  { id: 'frt-am-cap', state: 'AM', region: 'Norte', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 450, estimatedDays: 1, locationType: 'capital' },
  { id: 'frt-am-int', state: 'AM', region: 'Norte', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 680, estimatedDays: 3, locationType: 'interior' },
  { id: 'frt-pa-cap', state: 'PA', region: 'Norte', originWarehouse: 'manaus_le_16', originWarehouseLabel: 'Manaus LE 16 - Empresa 01/10', costPerUnit: 980, estimatedDays: 4, locationType: 'capital' }
];

export function getAutomaticWarehouseOrigin(state: string): { originWarehouse: 'empresa_13_armazem' | 'manaus_le_16'; label: string } {
  const southOrSoutheastExceptEs = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'];
  if (southOrSoutheastExceptEs.includes(state.toUpperCase())) {
    return { originWarehouse: 'empresa_13_armazem', label: 'Empresa 13 - Armazém (SP)' };
  }
  return { originWarehouse: 'manaus_le_16', label: 'Manaus Local de Estoque 16 (Empresa 01 / 10)' };
}

export function calculateAutomaticFreight(state: string, locationType: 'capital' | 'interior' = 'capital'): number {
  const entry = INITIAL_FREIGHT_TABLE.find(f => f.state.toUpperCase() === state.toUpperCase() && f.locationType === locationType);
  if (entry) return entry.costPerUnit;
  const fallback = INITIAL_FREIGHT_TABLE.find(f => f.state.toUpperCase() === state.toUpperCase());
  if (fallback) return fallback.costPerUnit;
  const origin = getAutomaticWarehouseOrigin(state);
  return origin.originWarehouse === 'empresa_13_armazem' ? 850 : 1300;
}
