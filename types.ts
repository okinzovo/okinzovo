
export enum AppView {
  SITE_EVALUATION = 'SITE_EVALUATION',
  NEGOTIATION = 'NEGOTIATION',
  FINANCIALS = 'FINANCIALS',
}

export interface StationConfig {
  id: string;
  name: string;
  count: number;
  power: number; // kW per unit
}

export interface CompetitorData {
  id: string;
  name: string;
  distance: number;
  count: number;
  gunType: string;
  price: number;
  operator: string;
}

// Global state interface
export interface ProjectData {
  // Site Info
  projectName: string;
  address: string;
  availableCapacity: number; // kVA - Primary grid input
  
  // Site Evaluation Data (New)
  regionEnergyLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'OTHER';
  demandPotential: number; // kWh/day
  demandRetail: number; // kWh/day
  countSupermarkets: number;
  countResidential: number;
  countParkingLots: number;
  
  competitors: CompetitorData[];

  // Hardware Config
  stations: StationConfig[];
  
  // CAPEX (4 Categories)
  pricePerWattPile: number;         // CNY/W
  pricePerWattTransformer: number;  // CNY/W
  pricePerWattDistribution: number; // CNY/W
  costOtherFixed: number;           // CNY (Civil, Grid Expansion, etc.)
  costOtherFixedRemark: string;     // Remark for other fixed costs
  
  // OPEX & Revenue
  // Electricity Prices (Time of Use)
  electricityPriceBuyPeak: number;
  electricityPriceBuyFlat: number;
  electricityPriceBuyValley: number;
  
  // Service Fees (Time of Use) - New
  serviceFeePeak: number;
  serviceFeeFlat: number;
  serviceFeeValley: number;
  
  // Time Ratios
  timeRatioPeak: number;
  timeRatioFlat: number;
  timeRatioValley: number;
  
  // Operational Parameters
  lineLossRate: number;        // %
  
  // OPEX - Updated to Fixed Costs per Watt
  opexPerWattMaintenance: number; // CNY/Watt/Year
  opexPerWattInsurance: number;   // CNY/Watt/Year
  opexAnnualOther: number;        // CNY/Year
  opexOtherRemark: string;        // Remark for other annual expenses
  opexPerKwhMarketing: number;    // CNY/kWh (Keep as variable)
  
  utilizationHours: number; // Avg hours per day per kW
  
  // Rent
  rentType: 'fixed' | 'revenue_share';
  rentAnnual: number;
  rentSharePercent: number; // 0-100
  
  // Site Scoring (0-10)
  scoreTraffic: number;
  scoreCompetition: number;
  scoreAmenities: number;

  // Scenario
  userPersona: string; 
}

export const DEFAULT_PROJECT: ProjectData = {
  projectName: "新建示范充电站项目",
  address: "",
  availableCapacity: 600,
  
  regionEnergyLevel: 'HIGH', // Default per request
  demandPotential: 1000,
  demandRetail: 500,
  countSupermarkets: 2,
  countResidential: 5,
  countParkingLots: 3,
  
  competitors: [],

  stations: [
    { id: 's1', name: '120kW 双枪直流', count: 5, power: 120 },
    { id: 's2', name: '7kW 交流桩', count: 10, power: 7 },
  ],
  
  // CAPEX Defaults
  pricePerWattPile: 0.4,
  pricePerWattTransformer: 0.15,
  pricePerWattDistribution: 0.1,
  costOtherFixed: 250000,
  costOtherFixedRemark: '土建施工及电网增容费',
  
  // OPEX Defaults
  electricityPriceBuyPeak: 1.1,
  electricityPriceBuyFlat: 0.7,
  electricityPriceBuyValley: 0.35,
  
  serviceFeePeak: 0.6,
  serviceFeeFlat: 0.4,
  serviceFeeValley: 0.3,
  
  timeRatioPeak: 0.3,
  timeRatioFlat: 0.4,
  timeRatioValley: 0.3,
  
  lineLossRate: 5, // 5%
  
  // New Fixed OPEX units (CNY/Watt/Year)
  opexPerWattMaintenance: 0.05, 
  opexPerWattInsurance: 0.02,
  opexAnnualOther: 10000,
  opexOtherRemark: '网络通讯及杂费',
  opexPerKwhMarketing: 0.02,
  
  utilizationHours: 3.6, // 15% default for MIXED
  
  rentType: 'revenue_share',
  rentAnnual: 100000,
  rentSharePercent: 15,
  
  scoreTraffic: 7,
  scoreCompetition: 5,
  scoreAmenities: 6,
  userPersona: 'MIXED'
};
