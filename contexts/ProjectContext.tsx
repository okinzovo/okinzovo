
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ProjectData, DEFAULT_PROJECT } from '../types';
import { ANALYSIS_YEARS, DAYS_IN_YEAR } from '../constants';

interface ProjectContextType {
  data: ProjectData;
  updateData: (updates: Partial<ProjectData>) => void;
  metrics: FinancialMetrics;
}

interface FinancialMetrics {
  totalPower: number; // kW
  totalWatts: number; // W
  utilizationPercent: number; // %
  
  // CAPEX Breakdown
  costPiles: number;
  costTransformer: number;
  costDistribution: number;
  costOthers: number;
  totalInvestment: number;
  avgCostPerWatt: number; // CNY/W
  
  // OPEX & Revenue
  annualEnergyOutput: number; // kWh (Sold)
  annualEnergyInput: number; // kWh (Bought, includes line loss)
  
  weightedBuyPrice: number;
  weightedServiceFee: number;
  avgRevenuePerKwh: number; // Sell Price + Service Fee
  
  annualRevenue: number;
  annualOpex: number;
  annualProfit: number;
  
  // Analysis
  cashFlow: number[];
  cumulativeCashFlow: number[];
  paybackPeriod: number; // Years
  npv: number;
  irr: number; // Percentage
  breakEvenUtilization: number;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ProjectData>(DEFAULT_PROJECT);

  const updateData = (updates: Partial<ProjectData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const metrics = useMemo(() => {
    // 1. Hardware & CAPEX
    const totalPower = data.stations.reduce((acc, s) => acc + (s.count * s.power), 0);
    const totalWatts = totalPower * 1000;
    const utilizationPercent = (data.utilizationHours / 24) * 100;

    const costPiles = totalWatts * data.pricePerWattPile;
    const costTransformer = totalWatts * data.pricePerWattTransformer;
    const costDistribution = totalWatts * data.pricePerWattDistribution;
    const costOthers = data.costOtherFixed;

    const totalInvestment = costPiles + costTransformer + costDistribution + costOthers;
    const avgCostPerWatt = totalWatts > 0 ? totalInvestment / totalWatts : 0;

    // 2. Energy Volume
    // Daily Energy = Total Power * Utilization Hours
    const dailyEnergyOutput = totalPower * data.utilizationHours;
    const annualEnergyOutput = dailyEnergyOutput * DAYS_IN_YEAR;
    
    // Line Loss affects input energy required
    const annualEnergyInput = annualEnergyOutput / (1 - (data.lineLossRate / 100));

    // 3. Unit Prices (Weighted Averages)
    const totalRatio = data.timeRatioPeak + data.timeRatioFlat + data.timeRatioValley;
    const normRatioPeak = totalRatio > 0 ? data.timeRatioPeak / totalRatio : 0.33;
    const normRatioFlat = totalRatio > 0 ? data.timeRatioFlat / totalRatio : 0.33;
    const normRatioValley = totalRatio > 0 ? data.timeRatioValley / totalRatio : 0.33;

    const weightedBuyPrice = 
      (data.electricityPriceBuyPeak * normRatioPeak) +
      (data.electricityPriceBuyFlat * normRatioFlat) +
      (data.electricityPriceBuyValley * normRatioValley);

    const weightedServiceFee = 
      (data.serviceFeePeak * normRatioPeak) +
      (data.serviceFeeFlat * normRatioFlat) +
      (data.serviceFeeValley * normRatioValley);

    // Revenue per kWh = Weighted Elec Price (Pass through typically) + Weighted Service Fee
    // In this model, we assume Sell Price = Buy Price (pass through) + Service Fee for simplicity,
    // UNLESS user specifically wants markup on electricity. 
    // Usually in China, electricity is pass-through + service fee.
    // Let's assume Revenue = (Weighted Buy Price + Weighted Service Fee)
    const avgRevenuePerKwh = weightedBuyPrice + weightedServiceFee;
      
    // 4. Annual Revenue
    const annualRevenue = annualEnergyOutput * avgRevenuePerKwh;

    // 5. Annual OPEX
    const costElectricity = annualEnergyInput * weightedBuyPrice;
    
    // Fixed costs based on Wattage
    const costMaintenance = totalWatts * data.opexPerWattMaintenance;
    const costInsurance = totalWatts * data.opexPerWattInsurance;
    const costOtherAnnual = data.opexAnnualOther;

    // Variable costs based on kWh output
    const costMarketing = annualEnergyOutput * data.opexPerKwhMarketing;

    let costRent = 0;
    if (data.rentType === 'fixed') {
        costRent = data.rentAnnual;
    } else {
        costRent = annualRevenue * (data.rentSharePercent / 100);
    }

    const annualOpex = costElectricity + costMaintenance + costInsurance + costOtherAnnual + costMarketing + costRent;
    const annualProfit = annualRevenue - annualOpex;

    // 6. Time Series & KPIs
    const cashFlow: number[] = [];
    const cumulativeCashFlow: number[] = [];
    let cumulative = -totalInvestment;
    let paybackPeriod = 99;

    // Year 0
    cashFlow.push(-totalInvestment);
    cumulativeCashFlow.push(cumulative);

    for (let i = 1; i <= ANALYSIS_YEARS; i++) {
        cashFlow.push(annualProfit);
        cumulative += annualProfit;
        cumulativeCashFlow.push(cumulative);

        if (cumulative >= 0 && paybackPeriod === 99) {
            // Linear interpolation for more precise payback period
            const prevCumulative = cumulativeCashFlow[i-1];
            const fraction = Math.abs(prevCumulative) / annualProfit;
            paybackPeriod = (i - 1) + fraction;
        }
    }

    // NPV (8% discount)
    const discountRate = 0.08;
    let npv = -totalInvestment;
    for (let i = 1; i <= ANALYSIS_YEARS; i++) {
        npv += annualProfit / Math.pow(1 + discountRate, i);
    }

    // IRR Approximation
    const roi = totalInvestment > 0 ? (annualProfit / totalInvestment) * 100 : 0;
    
    // Break-even Utilization Calculation
    // Total Revenue = kwh * (BuyPrice + ServiceFee)
    // Total Cost = kwh * (BuyPrice/(1-loss) + Marketing) + FixedCosts + Rent
    // if rent is share: Rent = kwh * (BuyPrice+ServiceFee) * share%
    
    // Contribution Margin per kWh = (BuyPrice + ServiceFee) * (1 - share%) - (BuyPrice/(1-loss) + Marketing)
    const shareRate = data.rentType === 'revenue_share' ? data.rentSharePercent / 100 : 0;
    const revPerKwhAfterShare = avgRevenuePerKwh * (1 - shareRate);
    const varCostPerKwh = (weightedBuyPrice / (1 - data.lineLossRate/100)) + data.opexPerKwhMarketing;
    
    const contributionPerKwh = revPerKwhAfterShare - varCostPerKwh;
    
    const fixedCosts = costMaintenance + costInsurance + costOtherAnnual + (data.rentType === 'fixed' ? data.rentAnnual : 0);

    let breakEvenUtilization = 0;
    if (contributionPerKwh > 0 && totalPower > 0) {
        const breakEvenKwh = fixedCosts / contributionPerKwh;
        breakEvenUtilization = (breakEvenKwh / DAYS_IN_YEAR) / totalPower;
    }

    return {
        totalPower,
        totalWatts,
        utilizationPercent,
        costPiles,
        costTransformer,
        costDistribution,
        costOthers,
        totalInvestment,
        avgCostPerWatt,
        annualEnergyOutput,
        annualEnergyInput,
        weightedBuyPrice,
        weightedServiceFee,
        avgRevenuePerKwh,
        annualRevenue,
        annualOpex,
        annualProfit,
        cashFlow,
        cumulativeCashFlow,
        paybackPeriod,
        npv,
        irr: parseFloat(roi.toFixed(2)),
        breakEvenUtilization: parseFloat(breakEvenUtilization.toFixed(2))
    };

  }, [data]);

  return (
    <ProjectContext.Provider value={{ data, updateData, metrics }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within ProjectProvider");
  return context;
};
