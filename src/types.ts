export type NavTab = 
  | 'dashboard' 
  | 'commitments' 
  | 'purchase' 
  | 'parts_catalog' 
  | 'inventory' 
  | 'sales' 
  | 'service_order' 
  | 'dealers_network' 
  | 'settings' 
  | 'support';

export type DealershipScope = 
  | 'jtoledo' 
  | 'motosul' 
  | 'novamotor'
  | 'riomotos'
  | 'savassi'
  | 'curitiba_speed'
  | 'floripa_motos'
  | 'asanorte_df'
  | 'cerrado_go'
  | 'salvador_prime'
  | 'recife_jtoledo'
  | 'amazonia_motos'
  | 'campinas_power'
  | string;

export type BrazilRegion = 'Sul' | 'Sudeste' | 'Centro-Oeste' | 'Nordeste' | 'Norte';
export type DealerTier = 'Diamante' | 'Ouro' | 'Prata' | 'Bronze';
export type DealershipStatus = 'ativa' | 'homologacao' | 'suspensa' | 'bloqueada';
export type TaxRegime = 'Lucro Real' | 'Lucro Presumido' | 'Simples Nacional';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'Restritivo';

export type DealershipUserRole = 
  | 'Diretor / Titular' 
  | 'Gerente Geral' 
  | 'Gerente Comercial' 
  | 'Consultor de Vendas' 
  | 'Chefe de Oficina' 
  | 'Analista Financeiro';

export type DealershipAccessLevel = 'admin_dealer' | 'vendas' | 'pos_vendas' | 'financeiro';

export interface DealershipUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  role: DealershipUserRole;
  accessLevel: DealershipAccessLevel;
  status: 'ativo' | 'inativo' | 'bloqueado';
  lastLogin?: string;
  passwordMasked: string;
  temporaryPasswordActive?: boolean;
  mustChangePasswordNextLogin?: boolean;
  createdAt?: string;
}

export interface DealershipBankAccount {
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: 'Conta Corrente PJ';
  pixKey: string;
  pixKeyType: 'CNPJ' | 'E-mail' | 'Telefone' | 'Chave Aleatória';
}

export interface DealershipProfile {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  city: string;
  state: string;
  region: BrazilRegion;
  cnpj: string;
  type: 'montadora' | 'concessionaria';
  tier?: DealerTier;
  status?: DealershipStatus;
  monthlyTarget: number;
  bannerColor: string;
  accentColor: string;
  phone: string;
  contactEmail?: string;
  manager: string;
  creditLimit?: number;
  creditUsed?: number;
  quotaAllocated?: number;
  quotaOrdered?: number;
  activeStockUnits?: number;
  monthlySalesCount?: number;

  // Complete Corporate Details
  dealerCode?: string; // e.g. "SZX-4109"
  legalName?: string; // Razão Social
  tradeName?: string; // Nome Fantasia
  stateRegistration?: string; // Inscrição Estadual
  municipalRegistration?: string; // Inscrição Municipal
  cnae?: string; // CNAE Principal
  taxRegime?: TaxRegime;
  foundedDate?: string;
  dealerContractNumber?: string;
  contractValidUntil?: string;
  brandsAuthorized?: BrandType[];

  // Full Address & Logistics
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  showroomAreaM2?: number;
  workshopAreaM2?: number;
  unloadingBayAvailable?: boolean;
  unloadingRestrictions?: string;

  // Users & Access credentials
  users?: DealershipUser[];

  // Financial & Credit
  floorPlanLimit?: number;
  defaultPaymentCondition?: string;
  creditRating?: CreditRating;
  onTimePaymentRate?: number;
  bankAccount?: DealershipBankAccount;
  rebateBonusPercentage?: number;
  financialContactEmail?: string;
  financialContactPhone?: string;
  creditNotes?: string;
  lastCreditReviewDate?: string;
  specialTermsNotes?: string;
}

export type DealershipFullProfile = Required<Pick<DealershipProfile, 
  | 'id' 
  | 'name' 
  | 'shortName' 
  | 'tagline' 
  | 'city' 
  | 'state' 
  | 'region' 
  | 'cnpj' 
  | 'type' 
  | 'tier' 
  | 'status'
  | 'monthlyTarget' 
  | 'bannerColor' 
  | 'accentColor' 
  | 'phone' 
  | 'contactEmail' 
  | 'manager' 
  | 'creditLimit' 
  | 'creditUsed'
  | 'dealerCode'
  | 'legalName'
  | 'tradeName'
  | 'stateRegistration'
  | 'municipalRegistration'
  | 'cnae'
  | 'taxRegime'
  | 'foundedDate'
  | 'dealerContractNumber'
  | 'contractValidUntil'
  | 'brandsAuthorized'
  | 'zipCode'
  | 'street'
  | 'number'
  | 'neighborhood'
  | 'unloadingBayAvailable'
  | 'users'
  | 'floorPlanLimit'
  | 'defaultPaymentCondition'
  | 'creditRating'
  | 'onTimePaymentRate'
  | 'bankAccount'
  | 'rebateBonusPercentage'
  | 'financialContactEmail'
  | 'financialContactPhone'
>> & DealershipProfile;

export type BrandType = 'Suzuki' | 'Zontes' | 'Haojue' | 'Quadriciclos';

export interface VehicleVariant {
  id: string;
  colorName: string;
  colorHex: string;
  colorCode?: string;
  imageUrl?: string;
  stockStatus: 'disponivel' | 'poucas' | 'sem_estoque';
  quantity: number;
}

export interface TechnicalSpecs {
  engineType: string;
  displacement: string;
  power: string;
  torque: string;
  compressionRatio?: string;
  fuelSystem: string;
  transmission: string;
  clutch?: string;
  startingSystem?: string;
  frontSuspension: string;
  rearSuspension: string;
  frontBrake: string;
  rearBrake: string;
  absSystem?: string;
  frontTire: string;
  rearTire: string;
  fuelTank: string;
  dryWeight?: string;
  curbWeight: string;
  seatHeight: string;
  groundClearance?: string;
  wheelbase?: string;
  topSpeed?: string;
  acceleration0to100?: string;
  avgConsumption?: string;
  estimatedRange?: string;
  ridingAids?: string[];
}

export interface PurchaseModel {
  id: string;
  brand: BrandType;
  modelName: string;
  yearModel?: string;
  category: string;
  storeStock: number;
  avgRegistration: string;
  monthlyPurchase: number;
  commitmentMonth3: number;
  factoryCost: number;
  ppsMSRP: number;
  variants: VehicleVariant[];
  selectedOrderType: 'Compra' | 'Consignação';
  selectedPayment: 'A Prazo' | 'À Vista';
  image?: string;
  dealershipId?: string;
  description?: string;
  performanceSummary?: string;
  technicalSpecs?: TechnicalSpecs;
  features?: string[];
  officialWebUrl?: string;
}

export type FactoryOrderStatus = 
  | 'aguardando_analise'
  | 'em_analise_credito'
  | 'credito_reprovado'
  | 'em_analise_comercial'
  | 'aprovado_comercial'
  | 'integrado_protheus'
  | 'em_producao'
  | 'faturado_despachado';

export interface StockScheduleItem {
  model: string;
  currentStockOwn: number;
  currentStockBinBlocked: number;
  currentStockBinLiberated: number;
  month1Commitment: number;
  month1Purchase: number;
  month2Commitment: number;
  month2Purchase: number;
  month3Commitment: number;
  month3Purchase: number;
}

export type MonthlyCommitmentStatus = 
  | 'rascunho'
  | 'enviado'
  | 'em_analise'
  | 'aprovado_fabrica'
  | 'ajustado_fabrica'
  | 'rejeitado';

export interface MonthlyCommitmentItem {
  id: string;
  model: string;
  brand: BrandType;
  category?: string;
  currentStockOwn: number;
  currentStockBinBlocked: number;
  currentStockBinLiberated: number;
  month1Commitment: number;
  month1Purchase: number;
  month2Commitment: number;
  month2Purchase: number;
  month3Commitment: number;
  month3Purchase: number;
  suggestedMSRPUnit: number;
  factoryCostUnit: number;
  notes?: string;
}

export interface MonthlyCommitmentPlan {
  id: string;
  dealershipId: string;
  dealershipName: string;
  legalName: string;
  dealerCode: string;
  brand: BrandType;
  period: string; // e.g. "Maio / 2026"
  month1Label: string; // e.g. "ABRIL" / "MAIO"
  month2Label: string; // e.g. "MAIO" / "JUNHO"
  month3Label: string; // e.g. "JUNHO" / "JULHO"
  regionalComercial: string;
  regionalFinanceira: string;
  avgMonthlyRegistration: number;
  dealerTier: DealerTier;
  bikesPerInvoice: number;
  transporterCode: string;
  originCode: string;
  items: MonthlyCommitmentItem[];
  status: MonthlyCommitmentStatus;
  createdAt: string;
  submittedAt?: string;
  submittedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  factoryNotes?: string;
  dealerNotes?: string;
  totalUnitsMonth1: number;
  totalUnitsMonth2: number;
  totalUnitsMonth3: number;
  totalEstimatedAmount: number;
  linkedApprovalProposalId?: string;
}

export interface ProposalPricingItem {
  id: string;
  quantity: number;
  modelName: string;
  modelYear: string;
  colorCode: string;
  paymentCondition: string;
  interestRatePercent: number;
  freightType: 'CIF' | 'FOB' | string;
  reserveFundUnit: number;
  suggestedMSRPUnit: number;
  productsBaseUnit: number;
  discountUnit: number;
  freightUnit: number;
  totalProductsUnit: number;
  icmsUnit: number;
  pisCofinsUnit: number;
  finalUnitValue: number;
  totalProductsSubtotal: number;
  totalFinalAmount: number;
}

export interface CreditAnalysisJTAJTZ {
  unifiedWarrantyTotal: number;
  jtaLimit: number;
  jtaWithinLimit: number;
  jtaTestRide: number;
  jtaOutsideLimitBinBloq: number;
  jtaProposalAmount: number;
  jtzLimit: number;
  jtzWithinLimit: number;
  jtzTestRide: number;
  jtzOutsideLimitBinBloq: number;
  jtzProposalAmount: number;
  paymentHistory: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'RESTRITIVO';
  committeeDecisionNotes?: string;
}

export interface OrderApprovalDocument {
  id: string;
  proposalNumber: string;
  date: string;
  brand: BrandType;
  dealershipId: string;
  dealershipName: string;
  legalName: string;
  dealerCode: string;
  originCode: string;
  dealerTier: DealerTier;
  regionalComercial: string;
  regionalFinanceira: string;
  avgMonthlyRegistration: number;
  transporterCode: string;
  bikesPerInvoice: number;
  month1Label: string;
  month2Label: string;
  month3Label: string;
  stockSchedule: StockScheduleItem[];
  creditAnalysis: CreditAnalysisJTAJTZ;
  pricingItems: ProposalPricingItem[];
  status: 'em_analise' | 'aprovado_financeiro' | 'aprovado_comercial' | 'aprovado_geral' | 'integrado_protheus' | 'rejeitado';
  financialApproved: boolean;
  financialApprovedBy?: string;
  financialApprovedAt?: string;
  financialNotes?: string;
  commercialApproved: boolean;
  commercialApprovedBy?: string;
  commercialApprovedAt?: string;
  commercialNotes?: string;
  protheusIntegrated: boolean;
  protheusOrderNumber?: string;
  protheusIntegratedAt?: string;
  handwrittenNotes: string[];
}

export interface FactoryOrderItem {
  id: string;
  modelId: string;
  modelName: string;
  brand: BrandType;
  category: string;
  colorName: string;
  colorHex: string;
  quantity: number;
  unitFactoryCost: number;
  unitMSRP: number;
  totalItemCost: number;
  availableColors?: { colorName: string; colorHex: string; inStock: boolean }[];
  image?: string;
}

export interface FactoryOrder {
  id: string;
  orderNumber: string;
  dealershipId: string;
  dealershipName: string;
  dealershipCity: string;
  dealershipState: string;
  dealershipRegion: BrazilRegion;
  dealershipTier: DealerTier;
  dealershipCnpj: string;
  createdAt: string;
  freightMode: 'CIF' | 'FOB';
  paymentMethod: 'A Prazo (30/60/90)' | 'À Vista' | 'Consignação Bancária';
  items: FactoryOrderItem[];
  totalAmount: number;
  totalUnits: number;
  status: FactoryOrderStatus;
  notes?: string;
  
  // Credit Approval Gate
  creditApproved: boolean;
  creditAnalyst?: string;
  creditApprovedAt?: string;
  creditNotes?: string;
  creditScore?: string;
  dealerCreditLimit: number;
  dealerCreditUsed: number;
  
  // Commercial Approval Gate
  commercialApproved: boolean;
  commercialManager?: string;
  commercialApprovedAt?: string;
  commercialNotes?: string;
  quotaImpact?: string;
  
  // TOTVS Protheus ERP Integration Details
  protheusIntegrated: boolean;
  protheusOrderNumber?: string;
  protheusIntegratedAt?: string;
  protheusWarehouse?: string;
  protheusNFeNumber?: string;
  protheusPaymentCondition?: string;
}

export interface InventoryItem {
  id: string;
  dealershipId: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  colorHex: string;
  costPrice: number;
  retailPrice: number;
  status: 'disponivel' | 'reservado' | 'vendido';
  engineDisplacement: string;
  power: string;
  notes?: string;
  plate?: string;
  arrivedDate: string;
}

export interface PipelineCard {
  id: string;
  dealershipId: string;
  customerName: string;
  type: 'lead' | 'proposta' | 'documentacao' | 'entrega';
  vehicleInterest: string;
  value: number;
  dateBadge: string;
  statusLabel?: string;
  statusBadgeColor?: string;
  notes?: string;
  phone?: string;
  email?: string;
  hot?: boolean;
  cnhStatus?: string;
  progressPercent?: number;
  appointmentTime?: string;
  avatar?: string;
}

export interface ServiceOrderItem {
  id: string;
  type: 'PEÇA' | 'SERVIÇO';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceOrder {
  id: string;
  dealershipId: string;
  osNumber: string;
  createdAt?: string;
  status: 'em_aberto' | 'aguardando_pecas' | 'em_execucao' | 'finalizado' | 'cancelado';
  customerName: string;
  customerCpfCnpj?: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleKm?: number;
  mileage?: string;
  fuelLevel?: 'Reserva' | '1/4' | 'Meio Tanque' | '3/4' | 'Tanque Cheio';
  reportedSymptoms?: string;
  serviceDescription?: string;
  technicalDiagnosis?: string;
  items?: ServiceOrderItem[];
  partsTotal?: number;
  laborTotal?: number;
  totalEstimated?: number;
  totalAmount?: number;
  entryDate?: string;
  estimatedCompletion?: string;
  mechanic?: string;
  priority?: 'Normal' | 'Alta' | 'Urgente';
}

export interface InteractionLog {
  id: string;
  dealershipId?: string;
  type: 'call' | 'whatsapp' | 'lead' | 'email';
  title: string;
  time: string;
  description: string;
}

export interface RecentSale {
  id: string;
  dealershipId: string;
  model: string;
  client: string;
  price: number;
  timeAgo: string;
}

export interface TransitOrder {
  id: string;
  dealershipId: string;
  batchName: string;
  eta: string;
  status: 'Chegando' | 'Atrasado' | 'No Prazo';
  location?: string;
  unitsCount?: number;
  value?: number;
}

// ==========================================
// ELECTRONIC PARTS CATALOG (EPC) & SPARE PARTS
// ==========================================

export type PartsBrand = 'Suzuki' | 'Haojue' | 'Zontes' | 'Quadriciclos';

export interface PartsModelSummary {
  id: string;
  brand: PartsBrand;
  name: string;
  commercialName: string;
  years: string;
  displacement: string;
  category: string;
  image: string;
  engineType: string;
  diagramsCount: number;
  totalPartsCount: number;
  chassisPrefix: string;
}

export interface PartsPinHotspot {
  ref: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  label?: string;
}

export interface PartsItem {
  id: string;
  ref: number;
  partNumber: string;
  description: string;
  subDescription?: string;
  assemblyTime?: string; // e.g. "01/06", "0.4h"
  observation?: string; // e.g. "M12X1,75X40", "NBR O-RING", "32X45X8"
  unitQuantity: number; // Qtd por conjunto / UN
  factoryPrice: number; // Preço de Fábrica Concessionária
  msrpPrice: number; // Preço Público Sugerido
  stockManaus: number;
  stockJundiai: number;
  inStock: boolean;
  categoryGroup: string;
  isEssentialMaintenance?: boolean;
}

export interface PartsDiagramGroup {
  id: string;
  groupCode: string; // e.g. "1", "2", "3"
  groupName: string; // e.g. "MOTOR & CÂMBIO", "CHASSI & SUSPENSÃO"
  subgroupCode: string; // e.g. "03", "05"
  illustrationCode: string; // e.g. "103-080", "100-030"
  title: string;
  subTitle?: string;
  diagramType: 'engine_block' | 'crankcase' | 'cylinder_head' | 'crankshaft_piston' | 'clutch' | 'injection_system' | 'transmission' | 'front_brake' | 'chassis_frame' | 'electrical_ecu';
  thumbnailUrl: string;
  hotspots: PartsPinHotspot[];
  parts: PartsItem[];
}

export interface PartsCartItem {
  id: string;
  modelId: string;
  modelName: string;
  brand: PartsBrand;
  illustrationCode: string;
  diagramTitle: string;
  part: PartsItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PartsOrderType = 'reposicao' | 'urgente_vor' | 'garantia_pos_venda';
export type PartsOrderStatus = 
  | 'aguardando_analise' 
  | 'em_analise_credito' 
  | 'verificando_estoque' 
  | 'aprovado_fabrica' 
  | 'integrado_protheus' 
  | 'em_separacao_cd' 
  | 'faturado_despachado' 
  | 'cancelado';

export interface PartsOrder {
  id: string;
  orderNumber: string; // e.g. "PED-PEC-2024-0891"
  dealershipId: string;
  dealershipName: string;
  dealershipCnpj: string;
  dealershipCity: string;
  dealershipState: string;
  dealershipRegion: string;
  dealershipTier?: string;
  orderType: PartsOrderType;
  status: PartsOrderStatus;
  createdAt: string;
  items: PartsCartItem[];
  totalPartsCount: number;
  totalUniqueItems: number;
  subtotalAmount: number;
  discountPercentage?: number;
  freightAmount: number;
  freightMode: 'CIF' | 'FOB';
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  vinApplication?: string;
  
  // Stock Check & Warehouses
  allocatedWarehouse?: 'CD Jundiaí (SP)' | 'CD Manaus (AM)' | 'Misto (Manaus + Jundiaí)';
  stockVerified?: boolean;
  stockVerifiedAt?: string;
  stockAnalyst?: string;

  // Credit Review
  creditApproved: boolean;
  creditApprovedAt?: string;
  creditAnalyst?: string;
  creditNotes?: string;

  // Commercial Approval
  commercialApproved: boolean;
  commercialApprovedAt?: string;
  commercialManager?: string;
  commercialNotes?: string;

  // TOTVS Protheus ERP Integration
  protheusIntegrated: boolean;
  protheusOrderNumber?: string; // SC5 ERP
  protheusIntegratedAt?: string;
  protheusNFeNumber?: string;
  protheusTrackingCode?: string;
  protheusCarrierName?: string;
}

