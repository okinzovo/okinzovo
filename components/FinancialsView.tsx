

import React from 'react';
import { useProject } from '../contexts/ProjectContext';
import { USER_PERSONAS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calculator, DollarSign, TrendingUp, AlertCircle, Zap, Users } from 'lucide-react';

const FinancialsView: React.FC = () => {
  const { data, updateData, metrics } = useProject();

  const handlePersonaChange = (personaId: string) => {
    const persona = USER_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      updateData({
        userPersona: personaId,
        utilizationHours: persona.utilization,
        timeRatioPeak: persona.ratioPeak,
        timeRatioFlat: persona.ratioFlat,
        timeRatioValley: persona.ratioValley,
      });
    }
  };

  const cashFlowData = metrics.cashFlow.slice(1).map((flow, index) => ({
    year: `Y${index + 1}`,
    profit: flow,
    cumulative: metrics.cumulativeCashFlow[index + 1]
  }));

  const investmentPieData = [
    { name: '充电设备', value: metrics.costPiles, color: '#0ea5e9' },
    { name: '变压器', value: metrics.costTransformer, color: '#6366f1' },
    { name: '配电设施', value: metrics.costDistribution, color: '#8b5cf6' },
    { name: '其他(土建/增容)', value: metrics.costOthers, color: '#cbd5e1' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">总投资 (CAPEX)</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">¥ {(metrics.totalInvestment / 10000).toFixed(1)} 万</div>
          <div className="text-xs text-slate-400 mt-1">单瓦造价: ¥{metrics.avgCostPerWatt.toFixed(2)}/W</div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">预计年净利</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">¥ {(metrics.annualProfit / 10000).toFixed(1)} 万</div>
          <div className="text-xs text-slate-400 mt-1">年售电: {(metrics.annualEnergyOutput/10000).toFixed(1)}万度</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">静态回收期</span>
          </div>
          <div className={`text-2xl font-bold ${metrics.paybackPeriod > 6 ? 'text-orange-500' : 'text-blue-600'}`}>
            {metrics.paybackPeriod > 20 ? '> 20' : metrics.paybackPeriod.toFixed(1)} 年
          </div>
          <div className="text-xs text-slate-400 mt-1">IRR: {metrics.irr.toFixed(1)}%</div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">盈亏平衡利用率</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{metrics.breakEvenUtilization.toFixed(1)} %</div>
          <div className="text-xs text-slate-400 mt-1">当前利用率: {metrics.utilizationPercent.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 1. Investment Costs (The 4 Categories) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-blue-500 mr-2 rounded-full"></span>
              投资成本明细 (CAPEX)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-600 mb-1">充电设备 (元/W)</label>
                   <input 
                    type="number" step="0.01" 
                    value={data.pricePerWattPile}
                    onChange={(e) => updateData({ pricePerWattPile: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-600 mb-1">变压器 (元/W)</label>
                   <input 
                    type="number" step="0.01" 
                    value={data.pricePerWattTransformer}
                    onChange={(e) => updateData({ pricePerWattTransformer: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-600 mb-1">配电设施 (元/W)</label>
                   <input 
                    type="number" step="0.01" 
                    value={data.pricePerWattDistribution}
                    onChange={(e) => updateData({ pricePerWattDistribution: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-medium text-slate-600 mb-1">其他固定项 (元)</label>
                   <input 
                    type="number" 
                    value={data.costOtherFixed}
                    onChange={(e) => updateData({ costOtherFixed: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-500 mb-1">其他固定项备注</label>
                   <input 
                    type="text" 
                    value={data.costOtherFixedRemark}
                    onChange={(e) => updateData({ costOtherFixedRemark: e.target.value })}
                    className="w-full p-2 border border-slate-200 bg-slate-50 rounded text-xs"
                    placeholder="例如：土建施工、电网增容费等..."
                   />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
                 <span className="text-slate-500">规划总功率: {metrics.totalPower} kW</span>
                 <span className="text-slate-500">综合单瓦: {metrics.avgCostPerWatt.toFixed(2)} 元/W</span>
              </div>
            </div>
          </div>

          {/* 2. Scenario Simulation */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-indigo-500 mr-2 rounded-full"></span>
              收入情景模拟
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> 预设用户画像
              </label>
              <div className="grid grid-cols-2 gap-2">
                {USER_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaChange(p.id)}
                    className={`p-2 text-xs rounded border text-left transition ${data.userPersona === p.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="font-bold">{p.label}</div>
                    <div className="opacity-75 transform scale-90 origin-left">利用率 {((p.utilization/24)*100).toFixed(0)}%</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
               <div className="flex justify-between items-center mb-1">
                 <label className="block text-xs font-medium text-slate-600">功率利用率</label>
                 <div className="flex gap-2 text-xs">
                   <span className="text-indigo-600 font-bold">{metrics.utilizationPercent.toFixed(1)}%</span>
                   <span className="text-slate-400">({data.utilizationHours.toFixed(1)} h/天)</span>
                 </div>
               </div>
               <input 
                 type="range" min="0.5" max="15" step="0.1" 
                 value={data.utilizationHours}
                 onChange={(e) => updateData({ utilizationHours: Number(e.target.value), userPersona: 'CUSTOM' })}
                 className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
               />
            </div>
            
            <div className="mb-2">
               <label className="block text-xs font-medium text-slate-600 mb-2">分时服务费配置 (元/度)</label>
               <div className="flex gap-2">
                 <div className="flex-1">
                    <span className="text-[10px] text-orange-500 font-bold block">峰</span>
                    <input type="number" step="0.01" className="w-full border rounded p-1 text-sm" value={data.serviceFeePeak} onChange={e=>updateData({serviceFeePeak: Number(e.target.value)})} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] text-blue-500 font-bold block">平</span>
                    <input type="number" step="0.01" className="w-full border rounded p-1 text-sm" value={data.serviceFeeFlat} onChange={e=>updateData({serviceFeeFlat: Number(e.target.value)})} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] text-emerald-500 font-bold block">谷</span>
                    <input type="number" step="0.01" className="w-full border rounded p-1 text-sm" value={data.serviceFeeValley} onChange={e=>updateData({serviceFeeValley: Number(e.target.value)})} />
                 </div>
               </div>
            </div>
            
            <div className="mt-2 text-right">
               <span className="text-xs text-slate-500">综合平均营收: </span>
               <span className="text-sm font-bold text-slate-800">{metrics.avgRevenuePerKwh.toFixed(3)} 元/度</span>
            </div>
          </div>

          {/* 3. OPEX Details */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-emerald-500 mr-2 rounded-full"></span>
              运营成本参数 (OPEX)
            </h3>
            
            <div className="space-y-4">
               {/* Elec Price Input */}
               <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-800">电价配置 (购电)</span>
                    <span className="text-xs text-emerald-600">综合购电成本: {metrics.weightedBuyPrice.toFixed(3)}元</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     <div>
                       <label className="text-[10px] text-slate-500 block">峰时</label>
                       <input type="number" step="0.01" className="w-full p-1 text-sm border border-emerald-200 rounded" value={data.electricityPriceBuyPeak} onChange={e=>updateData({electricityPriceBuyPeak: Number(e.target.value)})} />
                     </div>
                     <div>
                       <label className="text-[10px] text-slate-500 block">平时</label>
                       <input type="number" step="0.01" className="w-full p-1 text-sm border border-emerald-200 rounded" value={data.electricityPriceBuyFlat} onChange={e=>updateData({electricityPriceBuyFlat: Number(e.target.value)})} />
                     </div>
                     <div>
                       <label className="text-[10px] text-slate-500 block">谷时</label>
                       <input type="number" step="0.01" className="w-full p-1 text-sm border border-emerald-200 rounded" value={data.electricityPriceBuyValley} onChange={e=>updateData({electricityPriceBuyValley: Number(e.target.value)})} />
                     </div>
                  </div>
                  <div className="mt-2">
                     <label className="text-[10px] text-slate-500 block mb-1">充电时段分布 (峰/平/谷) 需归一化</label>
                     <div className="flex gap-1">
                        <input type="number" step="0.1" className="w-full p-1 text-xs border border-slate-200 rounded bg-white" value={data.timeRatioPeak} onChange={e=>updateData({timeRatioPeak: Number(e.target.value)})} placeholder="峰占比" />
                        <input type="number" step="0.1" className="w-full p-1 text-xs border border-slate-200 rounded bg-white" value={data.timeRatioFlat} onChange={e=>updateData({timeRatioFlat: Number(e.target.value)})} placeholder="平占比" />
                        <input type="number" step="0.1" className="w-full p-1 text-xs border border-slate-200 rounded bg-white" value={data.timeRatioValley} onChange={e=>updateData({timeRatioValley: Number(e.target.value)})} placeholder="谷占比" />
                     </div>
                  </div>
               </div>
               
               {/* Costs */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">维护费 (元/W/年)</label>
                    <input 
                      type="number" step="0.01"
                      value={data.opexPerWattMaintenance}
                      onChange={(e) => updateData({ opexPerWattMaintenance: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">保险费 (元/W/年)</label>
                    <input 
                      type="number" step="0.01"
                      value={data.opexPerWattInsurance}
                      onChange={(e) => updateData({ opexPerWattInsurance: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">其他费用 (元/年)</label>
                    <input 
                      type="number" step="1000"
                      value={data.opexAnnualOther}
                      onChange={(e) => updateData({ opexAnnualOther: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">营销费 (元/度)</label>
                    <input 
                      type="number" step="0.01"
                      value={data.opexPerKwhMarketing}
                      onChange={(e) => updateData({ opexPerKwhMarketing: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-xs font-medium text-slate-500 mb-1">其他费用备注</label>
                     <input 
                      type="text" 
                      value={data.opexOtherRemark}
                      onChange={(e) => updateData({ opexOtherRemark: e.target.value })}
                      className="w-full p-2 border border-slate-200 bg-slate-50 rounded text-xs"
                      placeholder="例如：网络通讯费、SaaS平台费等..."
                     />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">线损率 (%)</label>
                    <input 
                      type="number" step="0.1"
                      value={data.lineLossRate}
                      onChange={(e) => updateData({ lineLossRate: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts & Analysis */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">10年期现金流预测</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                     fontSize={12} 
                     tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}w`} 
                     tickLine={false} 
                     axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`¥${(value).toLocaleString()}`, '金额']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    name="累计净现金流" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="当年净利润" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-600 mb-4">投资结构分布</h3>
               <div className="h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentPieData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {investmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `¥${(val/10000).toFixed(1)}万`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-600 mb-4">成本构成 (Top 3)</h3>
               <div className="space-y-3">
                  {[
                    { label: '电费支出', value: metrics.annualEnergyInput * metrics.weightedBuyPrice, color: 'bg-emerald-500' },
                    { label: '场地租金', value: data.rentType === 'fixed' ? data.rentAnnual : metrics.annualRevenue * data.rentSharePercent/100, color: 'bg-indigo-500' },
                    { label: '运维保险', value: metrics.totalWatts * (data.opexPerWattMaintenance + data.opexPerWattInsurance), color: 'bg-orange-500' }
                  ].sort((a,b) => b.value - a.value).map((item, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-bold">¥{(item.value / 10000).toFixed(1)}万</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.min(100, (item.value / metrics.annualOpex) * 100)}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinancialsView;
