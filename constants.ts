

// Model Names
export const AI_MODEL_TEXT = 'gemini-2.5-flash';

// Financial Constants
export const DAYS_IN_YEAR = 365;
export const ANALYSIS_YEARS = 10;
export const TAX_RATE = 0.25; // Simple corporate tax assumption

export const STATION_TYPES_DATA = [
  { id: '7kw', label: '7kW 交流桩', power: 7 },
  { id: '60kw', label: '60kW 直流桩', power: 60 },
  { id: '120kw', label: '120kW 双枪直流', power: 120 },
  { id: '250kw', label: '250kW 液冷超充', power: 250 },
];

export const USER_PERSONAS = [
  { 
    id: 'PUBLIC', 
    label: '公共站', 
    desc: '利用率 10%',
    utilization: 2.4, // 10% * 24h
    ratioPeak: 0.4, ratioFlat: 0.4, ratioValley: 0.2 
  },
  { 
    id: 'DEDICATED', 
    label: '专用站', 
    desc: '利用率 20%',
    utilization: 4.8, // 20% * 24h
    ratioPeak: 0.1, ratioFlat: 0.3, ratioValley: 0.6 
  },
  { 
    id: 'RESIDENTIAL', 
    label: '小区站', 
    desc: '利用率 5%',
    utilization: 1.2, // 5% * 24h
    ratioPeak: 0.1, ratioFlat: 0.2, ratioValley: 0.7 
  },
  { 
    id: 'MIXED', 
    label: '公专用混合', 
    desc: '利用率 15%',
    utilization: 3.6, // 15% * 24h
    ratioPeak: 0.3, ratioFlat: 0.4, ratioValley: 0.3 
  },
];
