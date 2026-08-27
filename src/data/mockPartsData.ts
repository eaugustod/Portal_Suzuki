import { PartsModelSummary, PartsDiagramGroup, PartsOrder } from '../types';
import { MOCK_PARTS_MODELS } from './mockPartsModels';
import { INITIAL_MOCK_PARTS_ORDERS } from './mockPartsOrders';

import { HAYABUSA_M5_CONVERTED_DIAGRAMS } from './hayabusaM5CatalogData';
import { GSX_S1000GX_M5_CONVERTED_DIAGRAMS } from './gsxS1000gxM5CatalogData';
import { GSX_S1000GT_M5_CONVERTED_DIAGRAMS } from './gsxS1000gtM5CatalogData';
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
import { HAOJUE_AGILITY200I_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_agility200iCatalogData';
import { HAOJUE_AK550_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_ak550CatalogData';
import { HAOJUE_CHOPPER_CBS_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_chopper_cbsCatalogData';
import { HAOJUE_CHOPPER_ROAD_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_chopper_roadCatalogData';
import { HAOJUE_DK150_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk150CatalogData';
import { HAOJUE_DK150_CBS_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk150_cbsCatalogData';
import { HAOJUE_DK150_CBS_M2_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk150_cbs_m2CatalogData';
import { HAOJUE_DK150_FI_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk150_fiCatalogData';
import { HAOJUE_DK150S_FI_M2_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk150s_fi_m2CatalogData';
import { HAOJUE_DK160_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dk160CatalogData';
import { HAOJUE_DOWNTOWN_300I_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_downtown_300iCatalogData';
import { HAOJUE_DR160_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dr160CatalogData';
import { HAOJUE_DR160_FI_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_dr160_fiCatalogData';
import { HAOJUE_FORGE_400I_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_forge_400iCatalogData';
import { HAOJUE_LINDY_125_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_lindy_125CatalogData';
import { HAOJUE_LINDY_125_CBS_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_lindy_125_cbsCatalogData';
import { HAOJUE_LINDY_125_CBS_M2_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_lindy_125_cbs_m2CatalogData';
import { HAOJUE_MASTER_RIDE_P5_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_master_ride_p5CatalogData';
import { HAOJUE_NEX_115_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_nex_115CatalogData';
import { HAOJUE_NK150_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_nk150CatalogData';
import { HAOJUE_PEOPLE_GT_300I_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_people_gt_300iCatalogData';
import { HAOJUE_PPV_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_ppvCatalogData';
import { HAOJUE_R_310_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_r_310CatalogData';
import { HAOJUE_T_310_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_t_310CatalogData';
import { HAOJUE_T_350_X_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_t_350_xCatalogData';
import { HAOJUE_VR150_CONVERTED_DIAGRAMS } from './generated_catalogs/haojue_vr150CatalogData';
import { SUZUKI_AN650_K6_K7_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_an650_k6_k7_k8_k9CatalogData';
import { SUZUKI_AN650_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_an650_l0CatalogData';
import { SUZUKI_AZ50_LETS_II_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_az50_lets_iiCatalogData';
import { SUZUKI_BANDIT_1250S_K7_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_1250s_k7_k8_k9CatalogData';
import { SUZUKI_BANDIT_1250S_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_1250s_l0CatalogData';
import { SUZUKI_BANDIT_1250S_L1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_1250s_l1CatalogData';
import { SUZUKI_BANDIT650S_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit650s_k5_k6CatalogData';
import { SUZUKI_BANDIT650S_K7_K8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit650s_k7_k8CatalogData';
import { SUZUKI_BANDIT650S_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit650s_k9CatalogData';
import { SUZUKI_BANDIT650S_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit650s_l0CatalogData';
import { SUZUKI_BANDIT_N1200_S1200_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_n1200_s1200_k6CatalogData';
import { SUZUKI_BANDIT_N600_S_T_V_W_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_n600_s_t_v_w_xCatalogData';
import { SUZUKI_BANDIT_N600_Y_K1_K2_K3_K4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bandit_n600_y_k1_k2_k3_k4CatalogData';
import { SUZUKI_BKING_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bking_k8_k9CatalogData';
import { SUZUKI_BKING_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_bking_l0CatalogData';
import { SUZUKI_BOULEVARD_C1500_K5_K6_K7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_c1500_k5_k6_k7CatalogData';
import { SUZUKI_BOULEVARD_C1500_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_c1500_k9CatalogData';
import { SUZUKI_BOULEVARD_C1500_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_c1500_l0CatalogData';
import { SUZUKI_BOULEVARD_C1500_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_c1500_w_x_y_k1_k2_k3CatalogData';
import { SUZUKI_BOULEVARD_M1800RBZ_L4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800rbz_l4CatalogData';
import { SUZUKI_BOULEVARD_M1800RBZ_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800rbz_l6CatalogData';
import { SUZUKI_BOULEVARD_M1800R_L4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800r_l4CatalogData';
import { SUZUKI_BOULEVARD_M1800R_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800r_l5CatalogData';
import { SUZUKI_BOULEVARD_M1800R_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800r_l6CatalogData';
import { SUZUKI_BOULEVARD_M1800RZ_L4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m1800rz_l4CatalogData';
import { SUZUKI_BOULEVARD_M800_L1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m800_l1CatalogData';
import { SUZUKI_BOULEVARD_M800_L4_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m800_l4_l5CatalogData';
import { SUZUKI_BOULEVARD_M800Z_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_boulevard_m800z_k9CatalogData';
import { SUZUKI_BURGMAN_125_J8_J9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_125_j8_j9CatalogData';
import { SUZUKI_BURGMAN_AN400_K3_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_an400_k3_k5_k6CatalogData';
import { SUZUKI_BURGMAN_AN400_K7_K8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_an400_k7_k8CatalogData';
import { SUZUKI_BURGMAN_AN400_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_an400_k9CatalogData';
import { SUZUKI_BURGMAN_AN400_L1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_an400_l1CatalogData';
import { SUZUKI_BURGMAN_AN400_Y_K1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_an400_y_k1CatalogData';
import { SUZUKI_BURGMAN_EXECUTIVE_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_executive_l5CatalogData';
import { SUZUKI_BURGMAN_I_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_burgman_iCatalogData';
import { SUZUKI_DR350_L_M_N_P_R_S_T_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_dr350_l_m_n_p_r_s_tCatalogData';
import { SUZUKI_DRZ400E_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_drz400e_k5_k6CatalogData';
import { SUZUKI_DRZ400E_K7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_drz400e_k7CatalogData';
import { SUZUKI_DRZ400E_STREET_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_drz400e_streetCatalogData';
import { SUZUKI_DRZ400E_Y_K1_K2_K3_K4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_drz400e_y_k1_k2_k3_k4CatalogData';
import { SUZUKI_E_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_e_350CatalogData';
import { SUZUKI_EN125_YES_CARGO_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_en125_yes_cargoCatalogData';
import { SUZUKI_EN125_YES_J5_J6_J7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_en125_yes_j5_j6_j7CatalogData';
import { SUZUKI_EN125_YES_J8_J9_JA_JB_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_en125_yes_j8_j9_ja_jbCatalogData';
import { SUZUKI_EN125_YES_SE_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_en125_yes_seCatalogData';
import { SUZUKI_FREEWIND_V_W_X_Y_K1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_freewind_v_w_x_y_k1CatalogData';
import { SUZUKI_GK_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gk_350CatalogData';
import { SUZUKI_GLADIUS_L2_L3_L4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gladius_l2_l3_l4CatalogData';
import { SUZUKI_GS120_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gs120CatalogData';
import { SUZUKI_GS500E_K1_K2_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gs500e_k1_k2CatalogData';
import { SUZUKI_GS500E_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gs500e_k6CatalogData';
import { SUZUKI_GS500E_K_L_M_N_O_P_R_S_T_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gs500e_k_l_m_n_o_p_r_s_tCatalogData';
import { SUZUKI_GS500E_V_W_X_Y_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gs500e_v_w_x_yCatalogData';
import { SUZUKI_GSR_125_S_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsr_125_sCatalogData';
import { SUZUKI_GSR750A_L2_L3_L4_L5_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsr750a_l2_l3_l4_l5_l6CatalogData';
import { SUZUKI_GSR750ZA_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsr750zaCatalogData';
import { SUZUKI_GSX1300RA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx1300ra_l8CatalogData';
import { SUZUKI_GSX1300_RA_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx1300_ra_l9CatalogData';
import { SUZUKI_GSX1300RA_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx1300ra_m0CatalogData';
import { SUZUKI_GSX_1300RAZB_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_1300razbCatalogData';
import { SUZUKI_GSX1300RRQ_M2_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx1300rrq_m2CatalogData';
import { SUZUKI_GSX650F_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx650f_k8_k9CatalogData';
import { SUZUKI_GSX650F_L2_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx650f_l2CatalogData';
import { SUZUKI_GSX750F_K4_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx750f_k4_k5_k6CatalogData';
import { SUZUKI_GSX750F_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx750f_w_x_y_k1_k2_k3CatalogData';
import { SUZUKI_GSX_R1000A_L7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000a_l7CatalogData';
import { SUZUKI_GSX_R1000A_L7_R_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000a_l7_rCatalogData';
import { SUZUKI_GSX_R1000A_L7_RZ_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000a_l7_rzCatalogData';
import { SUZUKI_GSX_R1000A_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000a_l8CatalogData';
import { SUZUKI_GSX_R1000_K1_K2_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_k1_k2CatalogData';
import { SUZUKI_GSX_R1000_K3_K4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_k3_k4CatalogData';
import { SUZUKI_GSX_R1000_K7_K8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_k7_k8CatalogData';
import { SUZUKI_GSX_R1000_L2_L3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_l2_l3CatalogData';
import { SUZUKI_GSX_R1000_L2_L3_L4_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_l2_l3_l4_l5CatalogData';
import { SUZUKI_GSX_R1000_L4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_l4CatalogData';
import { SUZUKI_GSX_R1000_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000_l5CatalogData';
import { SUZUKI_GSX_R1000RA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000ra_l8CatalogData';
import { SUZUKI_GSX_R1000RAZ_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000raz_l8CatalogData';
import { SUZUKI_GSX_R1000RAZ_M1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1000raz_m1CatalogData';
import { SUZUKI_GSX_R1100W_P_R_S_T_V_W_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r1100w_p_r_s_t_v_wCatalogData';
import { SUZUKI_GSX_R750_K6_K7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750_k6_k7CatalogData';
import { SUZUKI_GSX_R750_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750_k8_k9CatalogData';
import { SUZUKI_GSX_R750_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750_l0CatalogData';
import { SUZUKI_GSX_R750_T_V_W_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750_t_v_w_xCatalogData';
import { SUZUKI_GSX_R750W_N_P_R_S_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750w_n_p_r_sCatalogData';
import { SUZUKI_GSX_R750_Y_K1_K2_K3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_r750_y_k1_k2_k3CatalogData';
import { SUZUKI_GSX_S1000A_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000a_l6CatalogData';
import { SUZUKI_GSX_S1000A_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000a_l8CatalogData';
import { SUZUKI_GSX_S1000A_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000a_l9CatalogData';
import { SUZUKI_GSX_S1000A_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000a_m0CatalogData';
import { SUZUKI_GSX_S1000FA_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000fa_l6CatalogData';
import { SUZUKI_GSX_S1000FA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000fa_l8CatalogData';
import { SUZUKI_GSX_S1000FA_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000fa_l9CatalogData';
import { SUZUKI_GSX_S1000_GT_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000_gtCatalogData';
import { SUZUKI_GSX_S1000_M3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000_m3CatalogData';
import { SUZUKI_GSX_S1000YA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000ya_l8CatalogData';
import { SUZUKI_GSX_S1000YA_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000ya_l9CatalogData';
import { SUZUKI_GSX_S1000ZA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000za_l8CatalogData';
import { SUZUKI_GSX_S1000ZA_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s1000za_m0CatalogData';
import { SUZUKI_GSX_S750A_L7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750a_l7CatalogData';
import { SUZUKI_GSX_S750A_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750a_l8CatalogData';
import { SUZUKI_GSX_S750A_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750a_m0CatalogData';
import { SUZUKI_GSX_S750A_M1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750a_m1CatalogData';
import { SUZUKI_GSX_S750ZA_L7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750za_l7CatalogData';
import { SUZUKI_GSX_S750ZA_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750za_l8CatalogData';
import { SUZUKI_GSX_S750ZA_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750za_l9CatalogData';
import { SUZUKI_GSX_S750ZA_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750za_m0CatalogData';
import { SUZUKI_GSX_S750ZA_M1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_gsx_s750za_m1CatalogData';
import { SUZUKI_HAYABUSA_25_ANOS_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_25_anosCatalogData';
import { SUZUKI_HAYABUSA_K4_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_k4_k5_k6CatalogData';
import { SUZUKI_HAYABUSA_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_k8_k9CatalogData';
import { SUZUKI_HAYABUSA_L0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_l0CatalogData';
import { SUZUKI_HAYABUSA_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_l6CatalogData';
import { SUZUKI_HAYABUSA_M4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_m4CatalogData';
import { SUZUKI_HAYABUSA_RA_L3_L4_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_ra_l3_l4_l5CatalogData';
import { SUZUKI_HAYABUSA_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_hayabusa_x_y_k1_k2_k3CatalogData';
import { SUZUKI_INAZUMA_250_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_inazuma_250CatalogData';
import { SUZUKI_INTRUDER_125_JC_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_intruder_125_jcCatalogData';
import { SUZUKI_INTRUDER_250_T_ET_W_EW_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_intruder_250_t_et_w_ewCatalogData';
import { SUZUKI_LT50_L_X_Y_K1_K2_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_lt50_l_x_y_k1_k2CatalogData';
import { SUZUKI_LT80_T_V_W_X_Y_K1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_lt80_t_v_w_x_y_k1CatalogData';
import { SUZUKI_LTF160_K3_K4_K5_K6_K7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_ltf160_k3_k4_k5_k6_k7CatalogData';
import { SUZUKI_LTF160_L_M_N_P_R_S_T_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_ltf160_l_m_n_p_r_s_tCatalogData';
import { SUZUKI_LTF160_V_W_X_Y_K1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_ltf160_v_w_x_y_k1CatalogData';
import { SUZUKI_MARAUDER_K4_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_marauder_k4CatalogData';
import { SUZUKI_MARAUDER_V_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_marauder_v_w_x_y_k1_k2_k3CatalogData';
import { SUZUKI_R_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_r_350CatalogData';
import { SUZUKI_RF_900R_R_S_S2_T_V_W_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rf_900r_r_s_s2_t_v_wCatalogData';
import { SUZUKI_RM250_P_R_S_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rm250_p_r_sCatalogData';
import { SUZUKI_RM250_T_V_W_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rm250_t_v_w_xCatalogData';
import { SUZUKI_RM80_T_V_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rm80_t_vCatalogData';
import { SUZUKI_RMX250_K_L_M_N_S_T_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rmx250_k_l_m_n_s_tCatalogData';
import { SUZUKI_RMX250_V_W_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_rmx250_v_w_xCatalogData';
import { SUZUKI_S_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_s_350CatalogData';
import { SUZUKI_SV650A_L7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_sv650a_l7CatalogData';
import { SUZUKI_T_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_t_350CatalogData';
import { SUZUKI_T_350_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_t_350_xCatalogData';
import { SUZUKI_TL1000S_V_W_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_tl1000s_v_wCatalogData';
import { SUZUKI_V_350_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_350CatalogData';
import { SUZUKI_VS1400GLP_H_J_L_M_N_P_R_S_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vs1400glp_h_j_l_m_n_p_r_sCatalogData';
import { SUZUKI_VS1400GLP_T_V_W_X_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vs1400glp_t_v_w_xCatalogData';
import { SUZUKI_VS_800_GL_N_P_R_S_T_V_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vs_800_gl_n_p_r_s_t_vCatalogData';
import { SUZUKI_V_STROM_1000_A_L4_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_a_l4_l5CatalogData';
import { SUZUKI_V_STROM_1000_A_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_a_l9CatalogData';
import { SUZUKI_V_STROM_1000_K2_K3_K4_K5_K6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_k2_k3_k4_k5_k6CatalogData';
import { SUZUKI_V_STROM_1000_K7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_k7CatalogData';
import { SUZUKI_V_STROM_1000_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_l6CatalogData';
import { SUZUKI_V_STROM_1000_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_l8CatalogData';
import { SUZUKI_V_STROM_1000_XT_L8_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_xt_l8CatalogData';
import { SUZUKI_V_STROM_1000_XT_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1000_xt_l9CatalogData';
import { SUZUKI_V_STROM_1050_M3_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1050_m3CatalogData';
import { SUZUKI_V_STROM_1050RC_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_1050rc_m0CatalogData';
import { SUZUKI_V_STROM_650A_L2_L3_L4_L5_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650a_l2_l3_l4_l5CatalogData';
import { SUZUKI_V_STROM_650A_L9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650a_l9CatalogData';
import { SUZUKI_V_STROM_650_K8_K9_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650_k8_k9CatalogData';
import { SUZUKI_VSTROM650_L1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vstrom650_l1CatalogData';
import { SUZUKI_VSTROM650_L6_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vstrom650_l6CatalogData';
import { SUZUKI_VSTROM650_L6_XT_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vstrom650_l6_xtCatalogData';
import { SUZUKI_V_STROM_650_L7_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650_l7CatalogData';
import { SUZUKI_VSTROM650_L7_XT_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_vstrom650_l7_xtCatalogData';
import { SUZUKI_V_STROM_650_L9_XT_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650_l9_xtCatalogData';
import { SUZUKI_V_STROM_650_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650_m0CatalogData';
import { SUZUKI_V_STROM_650_M2_XT_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650_m2_xtCatalogData';
import { SUZUKI_V_STROM_650XT_M0_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650xt_m0CatalogData';
import { SUZUKI_V_STROM_650XT_M1_CONVERTED_DIAGRAMS } from './generated_catalogs/suzuki_v_strom_650xt_m1CatalogData';

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
  'haojue-haojue_agility200i': HAOJUE_AGILITY200I_CONVERTED_DIAGRAMS,
  'haojue-haojue_ak550': HAOJUE_AK550_CONVERTED_DIAGRAMS,
  'haojue-haojue_chopper_cbs': HAOJUE_CHOPPER_CBS_CONVERTED_DIAGRAMS,
  'haojue-haojue_chopper_road': HAOJUE_CHOPPER_ROAD_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk150': HAOJUE_DK150_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk150_cbs': HAOJUE_DK150_CBS_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk150_cbs_m2': HAOJUE_DK150_CBS_M2_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk150_fi': HAOJUE_DK150_FI_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk150s_fi_m2': HAOJUE_DK150S_FI_M2_CONVERTED_DIAGRAMS,
  'haojue-haojue_dk160': HAOJUE_DK160_CONVERTED_DIAGRAMS,
  'haojue-haojue_downtown_300i': HAOJUE_DOWNTOWN_300I_CONVERTED_DIAGRAMS,
  'haojue-haojue_dr160': HAOJUE_DR160_CONVERTED_DIAGRAMS,
  'haojue-haojue_dr160_fi': HAOJUE_DR160_FI_CONVERTED_DIAGRAMS,
  'haojue-haojue_forge_400i': HAOJUE_FORGE_400I_CONVERTED_DIAGRAMS,
  'haojue-haojue_lindy_125': HAOJUE_LINDY_125_CONVERTED_DIAGRAMS,
  'haojue-haojue_lindy_125_cbs': HAOJUE_LINDY_125_CBS_CONVERTED_DIAGRAMS,
  'haojue-haojue_lindy_125_cbs_m2': HAOJUE_LINDY_125_CBS_M2_CONVERTED_DIAGRAMS,
  'haojue-haojue_master_ride_p5': HAOJUE_MASTER_RIDE_P5_CONVERTED_DIAGRAMS,
  'haojue-haojue_nex_115': HAOJUE_NEX_115_CONVERTED_DIAGRAMS,
  'haojue-haojue_nk150': HAOJUE_NK150_CONVERTED_DIAGRAMS,
  'haojue-haojue_people_gt_300i': HAOJUE_PEOPLE_GT_300I_CONVERTED_DIAGRAMS,
  'haojue-haojue_ppv': HAOJUE_PPV_CONVERTED_DIAGRAMS,
  'haojue-haojue_r_310': HAOJUE_R_310_CONVERTED_DIAGRAMS,
  'haojue-haojue_t_310': HAOJUE_T_310_CONVERTED_DIAGRAMS,
  'haojue-haojue_t_350_x': HAOJUE_T_350_X_CONVERTED_DIAGRAMS,
  'haojue-haojue_vr150': HAOJUE_VR150_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_an650_k6_k7_k8_k9': SUZUKI_AN650_K6_K7_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_an650_l0': SUZUKI_AN650_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_az50_lets_ii': SUZUKI_AZ50_LETS_II_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_1250s_k7_k8_k9': SUZUKI_BANDIT_1250S_K7_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_1250s_l0': SUZUKI_BANDIT_1250S_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_1250s_l1': SUZUKI_BANDIT_1250S_L1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit650s_k5_k6': SUZUKI_BANDIT650S_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit650s_k7_k8': SUZUKI_BANDIT650S_K7_K8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit650s_k9': SUZUKI_BANDIT650S_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit650s_l0': SUZUKI_BANDIT650S_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_n1200_s1200_k6': SUZUKI_BANDIT_N1200_S1200_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_n600_s_t_v_w_x': SUZUKI_BANDIT_N600_S_T_V_W_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bandit_n600_y_k1_k2_k3_k4': SUZUKI_BANDIT_N600_Y_K1_K2_K3_K4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bking_k8_k9': SUZUKI_BKING_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_bking_l0': SUZUKI_BKING_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_c1500_k5_k6_k7': SUZUKI_BOULEVARD_C1500_K5_K6_K7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_c1500_k9': SUZUKI_BOULEVARD_C1500_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_c1500_l0': SUZUKI_BOULEVARD_C1500_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_c1500_w_x_y_k1_k2_k3': SUZUKI_BOULEVARD_C1500_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800rbz_l4': SUZUKI_BOULEVARD_M1800RBZ_L4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800rbz_l6': SUZUKI_BOULEVARD_M1800RBZ_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800r_l4': SUZUKI_BOULEVARD_M1800R_L4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800r_l5': SUZUKI_BOULEVARD_M1800R_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800r_l6': SUZUKI_BOULEVARD_M1800R_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m1800rz_l4': SUZUKI_BOULEVARD_M1800RZ_L4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m800_l1': SUZUKI_BOULEVARD_M800_L1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m800_l4_l5': SUZUKI_BOULEVARD_M800_L4_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_boulevard_m800z_k9': SUZUKI_BOULEVARD_M800Z_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_125_j8_j9': SUZUKI_BURGMAN_125_J8_J9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_an400_k3_k5_k6': SUZUKI_BURGMAN_AN400_K3_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_an400_k7_k8': SUZUKI_BURGMAN_AN400_K7_K8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_an400_k9': SUZUKI_BURGMAN_AN400_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_an400_l1': SUZUKI_BURGMAN_AN400_L1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_an400_y_k1': SUZUKI_BURGMAN_AN400_Y_K1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_executive_l5': SUZUKI_BURGMAN_EXECUTIVE_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_burgman_i': SUZUKI_BURGMAN_I_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_dr350_l_m_n_p_r_s_t': SUZUKI_DR350_L_M_N_P_R_S_T_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_drz400e_k5_k6': SUZUKI_DRZ400E_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_drz400e_k7': SUZUKI_DRZ400E_K7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_drz400e_street': SUZUKI_DRZ400E_STREET_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_drz400e_y_k1_k2_k3_k4': SUZUKI_DRZ400E_Y_K1_K2_K3_K4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_e_350': SUZUKI_E_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_en125_yes_cargo': SUZUKI_EN125_YES_CARGO_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_en125_yes_j5_j6_j7': SUZUKI_EN125_YES_J5_J6_J7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_en125_yes_j8_j9_ja_jb': SUZUKI_EN125_YES_J8_J9_JA_JB_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_en125_yes_se': SUZUKI_EN125_YES_SE_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_freewind_v_w_x_y_k1': SUZUKI_FREEWIND_V_W_X_Y_K1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gk_350': SUZUKI_GK_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gladius_l2_l3_l4': SUZUKI_GLADIUS_L2_L3_L4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gs120': SUZUKI_GS120_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gs500e_k1_k2': SUZUKI_GS500E_K1_K2_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gs500e_k6': SUZUKI_GS500E_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gs500e_k_l_m_n_o_p_r_s_t': SUZUKI_GS500E_K_L_M_N_O_P_R_S_T_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gs500e_v_w_x_y': SUZUKI_GS500E_V_W_X_Y_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsr_125_s': SUZUKI_GSR_125_S_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsr750a_l2_l3_l4_l5_l6': SUZUKI_GSR750A_L2_L3_L4_L5_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsr750za': SUZUKI_GSR750ZA_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx1300ra_l8': SUZUKI_GSX1300RA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx1300_ra_l9': SUZUKI_GSX1300_RA_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx1300ra_m0': SUZUKI_GSX1300RA_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_1300razb': SUZUKI_GSX_1300RAZB_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx1300rrq_m2': SUZUKI_GSX1300RRQ_M2_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx650f_k8_k9': SUZUKI_GSX650F_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx650f_l2': SUZUKI_GSX650F_L2_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx750f_k4_k5_k6': SUZUKI_GSX750F_K4_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx750f_w_x_y_k1_k2_k3': SUZUKI_GSX750F_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000a_l7': SUZUKI_GSX_R1000A_L7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000a_l7_r': SUZUKI_GSX_R1000A_L7_R_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000a_l7_rz': SUZUKI_GSX_R1000A_L7_RZ_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000a_l8': SUZUKI_GSX_R1000A_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_k1_k2': SUZUKI_GSX_R1000_K1_K2_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_k3_k4': SUZUKI_GSX_R1000_K3_K4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_k7_k8': SUZUKI_GSX_R1000_K7_K8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_l2_l3': SUZUKI_GSX_R1000_L2_L3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_l2_l3_l4_l5': SUZUKI_GSX_R1000_L2_L3_L4_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_l4': SUZUKI_GSX_R1000_L4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000_l5': SUZUKI_GSX_R1000_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000ra_l8': SUZUKI_GSX_R1000RA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000raz_l8': SUZUKI_GSX_R1000RAZ_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1000raz_m1': SUZUKI_GSX_R1000RAZ_M1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r1100w_p_r_s_t_v_w': SUZUKI_GSX_R1100W_P_R_S_T_V_W_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750_k6_k7': SUZUKI_GSX_R750_K6_K7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750_k8_k9': SUZUKI_GSX_R750_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750_l0': SUZUKI_GSX_R750_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750_t_v_w_x': SUZUKI_GSX_R750_T_V_W_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750w_n_p_r_s': SUZUKI_GSX_R750W_N_P_R_S_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_r750_y_k1_k2_k3': SUZUKI_GSX_R750_Y_K1_K2_K3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000a_l6': SUZUKI_GSX_S1000A_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000a_l8': SUZUKI_GSX_S1000A_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000a_l9': SUZUKI_GSX_S1000A_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000a_m0': SUZUKI_GSX_S1000A_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000fa_l6': SUZUKI_GSX_S1000FA_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000fa_l8': SUZUKI_GSX_S1000FA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000fa_l9': SUZUKI_GSX_S1000FA_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000_gt': SUZUKI_GSX_S1000_GT_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000_m3': SUZUKI_GSX_S1000_M3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000ya_l8': SUZUKI_GSX_S1000YA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000ya_l9': SUZUKI_GSX_S1000YA_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000za_l8': SUZUKI_GSX_S1000ZA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s1000za_m0': SUZUKI_GSX_S1000ZA_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750a_l7': SUZUKI_GSX_S750A_L7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750a_l8': SUZUKI_GSX_S750A_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750a_m0': SUZUKI_GSX_S750A_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750a_m1': SUZUKI_GSX_S750A_M1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750za_l7': SUZUKI_GSX_S750ZA_L7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750za_l8': SUZUKI_GSX_S750ZA_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750za_l9': SUZUKI_GSX_S750ZA_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750za_m0': SUZUKI_GSX_S750ZA_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_gsx_s750za_m1': SUZUKI_GSX_S750ZA_M1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_25_anos': SUZUKI_HAYABUSA_25_ANOS_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_k4_k5_k6': SUZUKI_HAYABUSA_K4_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_k8_k9': SUZUKI_HAYABUSA_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_l0': SUZUKI_HAYABUSA_L0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_l6': SUZUKI_HAYABUSA_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_m4': SUZUKI_HAYABUSA_M4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_ra_l3_l4_l5': SUZUKI_HAYABUSA_RA_L3_L4_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_hayabusa_x_y_k1_k2_k3': SUZUKI_HAYABUSA_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_inazuma_250': SUZUKI_INAZUMA_250_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_intruder_125_jc': SUZUKI_INTRUDER_125_JC_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_intruder_250_t_et_w_ew': SUZUKI_INTRUDER_250_T_ET_W_EW_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_lt50_l_x_y_k1_k2': SUZUKI_LT50_L_X_Y_K1_K2_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_lt80_t_v_w_x_y_k1': SUZUKI_LT80_T_V_W_X_Y_K1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_ltf160_k3_k4_k5_k6_k7': SUZUKI_LTF160_K3_K4_K5_K6_K7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_ltf160_l_m_n_p_r_s_t': SUZUKI_LTF160_L_M_N_P_R_S_T_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_ltf160_v_w_x_y_k1': SUZUKI_LTF160_V_W_X_Y_K1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_marauder_k4': SUZUKI_MARAUDER_K4_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_marauder_v_w_x_y_k1_k2_k3': SUZUKI_MARAUDER_V_W_X_Y_K1_K2_K3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_r_350': SUZUKI_R_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rf_900r_r_s_s2_t_v_w': SUZUKI_RF_900R_R_S_S2_T_V_W_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rm250_p_r_s': SUZUKI_RM250_P_R_S_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rm250_t_v_w_x': SUZUKI_RM250_T_V_W_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rm80_t_v': SUZUKI_RM80_T_V_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rmx250_k_l_m_n_s_t': SUZUKI_RMX250_K_L_M_N_S_T_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_rmx250_v_w_x': SUZUKI_RMX250_V_W_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_s_350': SUZUKI_S_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_sv650a_l7': SUZUKI_SV650A_L7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_t_350': SUZUKI_T_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_t_350_x': SUZUKI_T_350_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_tl1000s_v_w': SUZUKI_TL1000S_V_W_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_350': SUZUKI_V_350_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vs1400glp_h_j_l_m_n_p_r_s': SUZUKI_VS1400GLP_H_J_L_M_N_P_R_S_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vs1400glp_t_v_w_x': SUZUKI_VS1400GLP_T_V_W_X_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vs_800_gl_n_p_r_s_t_v': SUZUKI_VS_800_GL_N_P_R_S_T_V_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_a_l4_l5': SUZUKI_V_STROM_1000_A_L4_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_a_l9': SUZUKI_V_STROM_1000_A_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_k2_k3_k4_k5_k6': SUZUKI_V_STROM_1000_K2_K3_K4_K5_K6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_k7': SUZUKI_V_STROM_1000_K7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_l6': SUZUKI_V_STROM_1000_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_l8': SUZUKI_V_STROM_1000_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_xt_l8': SUZUKI_V_STROM_1000_XT_L8_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1000_xt_l9': SUZUKI_V_STROM_1000_XT_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1050_m3': SUZUKI_V_STROM_1050_M3_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_1050rc_m0': SUZUKI_V_STROM_1050RC_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650a_l2_l3_l4_l5': SUZUKI_V_STROM_650A_L2_L3_L4_L5_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650a_l9': SUZUKI_V_STROM_650A_L9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650_k8_k9': SUZUKI_V_STROM_650_K8_K9_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vstrom650_l1': SUZUKI_VSTROM650_L1_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vstrom650_l6': SUZUKI_VSTROM650_L6_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vstrom650_l6_xt': SUZUKI_VSTROM650_L6_XT_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650_l7': SUZUKI_V_STROM_650_L7_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_vstrom650_l7_xt': SUZUKI_VSTROM650_L7_XT_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650_l9_xt': SUZUKI_V_STROM_650_L9_XT_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650_m0': SUZUKI_V_STROM_650_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650_m2_xt': SUZUKI_V_STROM_650_M2_XT_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650xt_m0': SUZUKI_V_STROM_650XT_M0_CONVERTED_DIAGRAMS,
  'suzuki-suzuki_v_strom_650xt_m1': SUZUKI_V_STROM_650XT_M1_CONVERTED_DIAGRAMS,
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
  'zontes-t501': ZONTES_T501_CONVERTED_DIAGRAMS,
  'suzuki-hayabusa': HAYABUSA_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-s1000': GSX_S1000_M5_CONVERTED_DIAGRAMS,
  'suzuki-gsx-8r': GSX_8R_M6_CONVERTED_DIAGRAMS,
  'suzuki-gsx-8s': GSX_8S_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-1050xt': VSTROM_1050_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-1050': VSTROM_1050_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-800de': VSTROM_800DE_M6_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-800': VSTROM_800_M5_CONVERTED_DIAGRAMS,
  'suzuki-vstrom-650xt': VSTROM_650XT_M5_CONVERTED_DIAGRAMS,
  'haojue-nk160': HAOJUE_NK150_CONVERTED_DIAGRAMS,
  'haojue-dk160': HAOJUE_DK160_CONVERTED_DIAGRAMS,
  'haojue-dr160': HAOJUE_DR160_CONVERTED_DIAGRAMS,
  'haojue-burgman-125': HAOJUE_LINDY_125_CONVERTED_DIAGRAMS,
  'zontes-350e': ZONTES_368G_CONVERTED_DIAGRAMS,
  'zontes-t350': ZONTES_T501_CONVERTED_DIAGRAMS,
  'zontes-t350x': ZONTES_T501_CONVERTED_DIAGRAMS,
  'zontes-r350': ZONTES_368G_CONVERTED_DIAGRAMS,
  'zontes-v350': ZONTES_368G_CONVERTED_DIAGRAMS,
  'zontes-s350': ZONTES_368G_CONVERTED_DIAGRAMS,
  'zontes-gk350': ZONTES_368G_CONVERTED_DIAGRAMS,
  'hisun-tactic-750-verde': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'hisun-tactic-750-camo': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'hisun-tactic-550': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'hisun-tactic-550-camo': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'hisun-tactic-400i': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'hisun-tactic-400i-camo': HAOJUE_DL160_CONVERTED_DIAGRAMS,
  'kymco-ak550-premium': HAOJUE_AK550_CONVERTED_DIAGRAMS,
  'kymco-downtown-350i-tcs': HAOJUE_DOWNTOWN_300I_CONVERTED_DIAGRAMS
};
