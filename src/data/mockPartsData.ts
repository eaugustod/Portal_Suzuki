import { PartsModelSummary, PartsDiagramGroup, PartsOrder } from '../types';
import { MOCK_PARTS_MODELS } from './mockPartsModels';
import { INITIAL_MOCK_PARTS_ORDERS } from './mockPartsOrders';

import { HAYABUSA_M5_CONVERTED_DIAGRAMS } from './hayabusaM5CatalogData';
import { GSX_S1000GX_M5_CONVERTED_DIAGRAMS } from './gsxS1000gxM5CatalogData';
import { GSX_S1000GT_M5_CONVERTED_DIAGRAMS } from './gsxS1000gtM5CatalogData';

export { MOCK_PARTS_MODELS } from './mockPartsModels';
export { INITIAL_MOCK_PARTS_ORDERS } from './mockPartsOrders';

export const MOCK_HAYABUSA_M5_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000GX_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000GT_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GT_M5_CONVERTED_DIAGRAMS;

export const MOCK_GSX_8S_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_8S_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_8R_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_800_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_800DE_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_1050_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_1050_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_650XT_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_650XT_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_HAYABUSA_M6_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_MASTER_RIDE_P5_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_HAOJUE_DL160_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GT_M5_CONVERTED_DIAGRAMS;
export const MOCK_ZONTES_368G_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GT_M5_CONVERTED_DIAGRAMS;
export const MOCK_ZONTES_T501_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GT_M5_CONVERTED_DIAGRAMS;

export const MOCK_HAYABUSA_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM800_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;

export const ALL_CATALOG_DIAGRAMS_MAP: { [modelId: string]: PartsDiagramGroup[] } = new Proxy({
  'suzuki-hayabusa-gsx1300r': HAYABUSA_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000gx': GSX_S1000GX_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000gt': GSX_S1000GT_M5_CONVERTED_DIAGRAMS,
  'suzuki-hayabusa': HAYABUSA_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000': GSX_S1000GX_M5_CONVERTED_DIAGRAMS,
}, {
  get: (target: Record<string, PartsDiagramGroup[]>, prop: string) => {
    if (prop in target) return target[prop];
    if (typeof prop === 'string') {
      if (prop.includes('gt') || prop.includes('haojue') || prop.includes('zontes')) {
        return GSX_S1000GT_M5_CONVERTED_DIAGRAMS;
      }
      if (prop.includes('gx') || prop.includes('vstrom') || prop.includes('gsx')) {
        return GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
      }
    }
    return HAYABUSA_M5_CONVERTED_DIAGRAMS;
  }
});
