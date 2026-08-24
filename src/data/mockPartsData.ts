import { PartsModelSummary, PartsDiagramGroup, PartsOrder } from '../types';
import { MOCK_PARTS_MODELS } from './mockPartsModels';
import { INITIAL_MOCK_PARTS_ORDERS } from './mockPartsOrders';

import { HAYABUSA_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/hayabusa_m5CatalogData';
import { GSX_S1000GX_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_s1000gx_m5CatalogData';
import { GSX_S1000GT_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_s1000gt_m5CatalogData';
import { GSX_8S_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_8s_m5CatalogData';
import { GSX_8S_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_8s_m6CatalogData';
import { GSX_8R_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_8r_m6CatalogData';
import { VSTROM_800_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_800_m5CatalogData';
import { VSTROM_800DE_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_800de_m6CatalogData';
import { VSTROM_1050_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_1050_m5CatalogData';
import { VSTROM_1050_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_1050_m6CatalogData';
import { VSTROM_650XT_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_650xt_m5CatalogData';
import { VSTROM_650XT_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/vstrom_650xt_m6CatalogData';
import { GSX_S1000_M5_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_s1000_m5CatalogData';
import { GSX_S1000_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/gsx_s1000_m6CatalogData';
import { HAYABUSA_M6_CONVERTED_DIAGRAMS } from './generated_catalogs/hayabusa_m6CatalogData';
import { MASTER_RIDE_P5_CONVERTED_DIAGRAMS } from './generated_catalogs/master_ride_p5CatalogData';
import { HAOJUE_DL160_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dl160CatalogData';
import { ZONTES_368G_CONVERTED_DIAGRAMS } from './generated_catalogs/zontes_368gCatalogData';
import { ZONTES_T501_CONVERTED_DIAGRAMS } from './generated_catalogs/zontes_t501CatalogData';

export { MOCK_PARTS_MODELS } from './mockPartsModels';
export { INITIAL_MOCK_PARTS_ORDERS } from './mockPartsOrders';

export const MOCK_HAYABUSA_M5_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000GX_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GX_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000GT_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000GT_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_8S_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_8S_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_8S_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_8S_M6_CONVERTED_DIAGRAMS;
export const MOCK_GSX_8R_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_8R_M6_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_800_M5_DIAGRAMS: PartsDiagramGroup[] = VSTROM_800_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_800DE_M6_DIAGRAMS: PartsDiagramGroup[] = VSTROM_800DE_M6_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_1050_M5_DIAGRAMS: PartsDiagramGroup[] = VSTROM_1050_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_1050_M6_DIAGRAMS: PartsDiagramGroup[] = VSTROM_1050_M6_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_650XT_M5_DIAGRAMS: PartsDiagramGroup[] = VSTROM_650XT_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM_650XT_M6_DIAGRAMS: PartsDiagramGroup[] = VSTROM_650XT_M6_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000_M5_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000_M5_CONVERTED_DIAGRAMS;
export const MOCK_GSX_S1000_M6_DIAGRAMS: PartsDiagramGroup[] = GSX_S1000_M6_CONVERTED_DIAGRAMS;
export const MOCK_HAYABUSA_M6_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M6_CONVERTED_DIAGRAMS;
export const MOCK_MASTER_RIDE_P5_DIAGRAMS: PartsDiagramGroup[] = MASTER_RIDE_P5_CONVERTED_DIAGRAMS;
export const MOCK_HAOJUE_DL160_DIAGRAMS: PartsDiagramGroup[] = HAOJUE_DL160_CONVERTED_DIAGRAMS;
export const MOCK_ZONTES_368G_DIAGRAMS: PartsDiagramGroup[] = ZONTES_368G_CONVERTED_DIAGRAMS;
export const MOCK_ZONTES_T501_DIAGRAMS: PartsDiagramGroup[] = ZONTES_T501_CONVERTED_DIAGRAMS;

export const MOCK_HAYABUSA_DIAGRAMS: PartsDiagramGroup[] = HAYABUSA_M5_CONVERTED_DIAGRAMS;
export const MOCK_VSTROM800_DIAGRAMS: PartsDiagramGroup[] = VSTROM_800_M5_CONVERTED_DIAGRAMS;

export const ALL_CATALOG_DIAGRAMS_MAP: { [modelId: string]: PartsDiagramGroup[] } = {
  'suzuki-hayabusa-gsx1300r': HAYABUSA_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000gx': GSX_S1000GX_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000gt': GSX_S1000GT_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-8s-m5': GSX_8S_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-8s-m6': GSX_8S_M6_CONVERTED_DIAGRAMS,
  'suzuki-gsx-8r-m6': GSX_8R_M6_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-800-m5': VSTROM_800_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-800de-m6': VSTROM_800DE_M6_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-1050-m5': VSTROM_1050_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-1050-m6': VSTROM_1050_M6_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-650xt-m5': VSTROM_650XT_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-650xt-m6': VSTROM_650XT_M6_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000-m5': GSX_S1000_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000-m6': GSX_S1000_M6_CONVERTED_DIAGRAMS,
  'suzuki-hayabusa-m6': HAYABUSA_M6_CONVERTED_DIAGRAMS,
  'haojue-master-ride-150': MASTER_RIDE_P5_CONVERTED_DIAGRAMS,
  'haojue-dl160': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'zontes-368g': ZONTES_368G_CONVERTED_DIAGRAMS,
  'zontes-t501': ZONTES_T501_CONVERTED_DIAGRAMS
};
