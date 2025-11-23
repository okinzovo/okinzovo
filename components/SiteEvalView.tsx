import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { StationConfig, CompetitorData } from '../types';
import { MapPin, Zap, LayoutDashboard, Plus, Trash2, Home, ShoppingCart, Car, Activity } from 'lucide-react';

const SiteEvalView: React.FC = () => {
  const { data, updateData, metrics } = useProject();

  // Station State Management
  const addStation = () => {
    const newStation: StationConfig = {
      id: Date.now().toString(),
      name: '自定义桩型',
      power: 60,
      count: 1
    };
    updateData({ stations: [...data.stations, newStation] });
  };

  const removeStation = (id: string) => {
    updateData({ stations: data.stations.filter(s => s.id !== id) });
  };

  const updateStation = (id: string, field: keyof StationConfig, value: any) => {
    const newStations = data.stations.map(s => {
      if (s.id === id) return { ...s, [field]: value };
      return s;
    });
    updateData({ stations: newStations });
  };

  // Competitor State Management
  const addCompetitor = () => {
    const newComp: CompetitorData = {
      id: Date.now().toString(),
      name: '',
      operator: '',
      distance: 1.0,
      count: 10,
      gunType: '快充',
      price: 1.2
    };
    updateData({ competitors: [...data.competitors, newComp] });
  };

  const removeCompetitor = (id: string) => {
    updateData({ competitors: data.competitors.filter(c => c.id !== id) });
  };

  const updateCompetitor = (id: string, field: keyof CompetitorData, value: any) => {
    const newComps = data.competitors.map(c => {
      if (c.id === id) return { ...c, [field]: value };
      return c;
    });
    updateData({ competitors: newComps });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500';
    if (score >= 5) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Location & Power */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              项目区位信息
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                value={data.projectName}
                onChange={(e) => updateData({ projectName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-medium mb-2 focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="项目名称"
              />
              <input 
                type="text" 
                value={data.address}
                onChange={(e) => updateData({ address: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-sm mb-2 focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="详细地址"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">区域需求情况</label>
                   <select 
                    value={data.regionEnergyLevel}
                    onChange={(e) => updateData({ regionEnergyLevel: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                   >
                     <option value="HIGH">高电量片区 (优选)</option>
                     <option value="MEDIUM">中电量片区</option>
                     <option value="LOW">低电量片区</option>
                     <option value="OTHER">其他</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">周边散客需求 (度/天)</label>
                   <input 
                    type="number"
                    value={data.demandRetail}
                    onChange={(e) => updateData({ demandRetail: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">周边潜客需求 (度/天)</label>
                   <input 
                    type="number"
                    value={data.demandPotential}
                    onChange={(e) => updateData({ demandPotential: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                   />
                </div>
              </div>

              {/* Improved Desktop Layout for POI Counters */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-500 mb-2">周边配套统计 (500m范围)</label>
                <div className="grid grid-cols-3 gap-4">
                   <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                     <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded"><ShoppingCart className="w-4 h-4" /></div>
                     <div className="flex-1">
                       <div className="text-[10px] text-slate-400">商超</div>
                       <input type="number" className="w-full bg-transparent font-bold text-sm outline-none" placeholder="0" value={data.countSupermarkets} onChange={e => updateData({countSupermarkets: Number(e.target.value)})} />
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                     <div className="p-1.5 bg-orange-100 text-orange-600 rounded"><Home className="w-4 h-4" /></div>
                     <div className="flex-1">
                       <div className="text-[10px] text-slate-400">小区</div>
                       <input type="number" className="w-full bg-transparent font-bold text-sm outline-none" placeholder="0" value={data.countResidential} onChange={e => updateData({countResidential: Number(e.target.value)})} />
                     </div>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                     <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><Car className="w-4 h-4" /></div>
                     <div className="flex-1">
                       <div className="text-[10px] text-slate-400">停车场</div>
                       <input type="number" className="w-full bg-transparent font-bold text-sm outline-none" placeholder="0" value={data.countParkingLots} onChange={e => updateData({countParkingLots: Number(e.target.value)})} />
                     </div>
                   </div>
                </div>
              </div>
            </div>
        </div>

        <div className="space-y-6">
           {/* Power Check */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                电力接入条件
              </h3>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                 <div>
                    <div className="text-amber-900 font-bold text-sm mb-1">电网可用余量 (kVA)</div>
                    <div className="text-amber-700 text-xs">直接影响项目可建设规模</div>
                 </div>
                 <input 
                    type="number" 
                    value={data.availableCapacity}
                    onChange={(e) => updateData({ availableCapacity: Number(e.target.value) })}
                    className="w-32 bg-white p-2 text-right rounded border border-amber-200 text-xl font-bold text-amber-900 focus:outline-none focus:border-amber-400"
                  />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                 <span className="text-slate-500">规划总功率:</span>
                 <span className={`font-bold ${metrics.totalPower > data.availableCapacity ? 'text-red-500' : 'text-emerald-500'}`}>
                   {metrics.totalPower} kW
                 </span>
              </div>
           </div>

           {/* Quick Scoring */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center"><Activity className="w-5 h-5 mr-2 text-slate-500"/> 快速评分</h3>
             <div className="space-y-3">
               {[
                 { l: '交通热度', v: data.scoreTraffic, f: (v:number) => updateData({scoreTraffic: v}) },
                 { l: '竞品强度', v: data.scoreCompetition, f: (v:number) => updateData({scoreCompetition: v}) },
                 { l: '配套设施', v: data.scoreAmenities, f: (v:number) => updateData({scoreAmenities: v}) }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <span className="text-xs w-16 text-slate-600">{item.l}</span>
                    <input type="range" min="1" max="10" value={item.v} onChange={(e) => item.f(Number(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getScoreColor(item.v)}`}>{item.v}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* 2. Station Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <LayoutDashboard className="w-5 h-5 mr-2 text-primary" />
              充电桩配置模拟
            </h3>
            <button onClick={addStation} className="flex items-center gap-1 text-primary text-sm font-medium hover:bg-sky-50 px-2 py-1 rounded transition">
               <Plus className="w-4 h-4" /> 添加桩型
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500">
                  <tr>
                     <th className="p-3 rounded-l-lg">桩型名称</th>
                     <th className="p-3">单桩功率 (kW)</th>
                     <th className="p-3">数量 (台)</th>
                     <th className="p-3 text-right">总功率 (kW)</th>
                     <th className="p-3 rounded-r-lg w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {data.stations.map((s) => (
                     <tr key={s.id} className="group hover:bg-slate-50/50">
                        <td className="p-2">
                           <input 
                             type="text" value={s.name} 
                             onChange={(e) => updateStation(s.id, 'name', e.target.value)}
                             className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none transition"
                           />
                        </td>
                        <td className="p-2">
                           <input 
                             type="number" value={s.power} 
                             onChange={(e) => updateStation(s.id, 'power', Number(e.target.value))}
                             className="w-20 bg-slate-100 p-1 rounded text-center font-mono focus:bg-white focus:ring-1 focus:ring-primary outline-none"
                           />
                        </td>
                        <td className="p-2">
                           <div className="flex items-center gap-2">
                             <button onClick={() => updateStation(s.id, 'count', Math.max(0, s.count - 1))} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300">-</button>
                             <span className="w-8 text-center font-bold">{s.count}</span>
                             <button onClick={() => updateStation(s.id, 'count', s.count + 1)} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center hover:border-slate-300">+</button>
                           </div>
                        </td>
                        <td className="p-2 text-right font-bold text-slate-700">
                           {s.count * s.power}
                        </td>
                        <td className="p-2 text-center">
                           <button onClick={() => removeStation(s.id)} className="text-slate-300 hover:text-red-500 transition">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
               <tfoot className="bg-slate-50/50 font-bold text-slate-800">
                  <tr>
                     <td colSpan={3} className="p-3 text-right">合计规划:</td>
                     <td className="p-3 text-right text-primary text-lg">{metrics.totalPower} kW</td>
                     <td></td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>

      {/* 3. Competitor Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
               <Activity className="w-5 h-5 mr-2 text-red-500" />
               周边5km竞品分析
            </h3>
            <button onClick={addCompetitor} className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:bg-indigo-50 px-2 py-1 rounded transition">
               <Plus className="w-4 h-4" /> 添加竞品
            </button>
         </div>
         
         {data.competitors.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
               暂无竞品数据，请添加周边充电站信息以辅助决策
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                     <tr>
                        <th className="p-3 rounded-l-lg">运营商/站名</th>
                        <th className="p-3">数量</th>
                        <th className="p-3">枪型</th>
                        <th className="p-3">均价 (元)</th>
                        <th className="p-3 rounded-r-lg w-16">操作</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {data.competitors.map((c) => (
                        <tr key={c.id}>
                           <td className="p-2">
                              <input type="text" placeholder="运营商" value={c.operator} onChange={e => updateCompetitor(c.id, 'operator', e.target.value)} className="w-full text-xs p-1 border rounded mb-1" />
                              <input type="text" placeholder="站名" value={c.name} onChange={e => updateCompetitor(c.id, 'name', e.target.value)} className="w-full text-xs p-1 border rounded" />
                           </td>
                           <td className="p-2">
                              <input type="number" value={c.count} onChange={e => updateCompetitor(c.id, 'count', Number(e.target.value))} className="w-16 p-1 border rounded text-center" />
                           </td>
                           <td className="p-2">
                              <select value={c.gunType} onChange={e => updateCompetitor(c.id, 'gunType', e.target.value)} className="w-full p-1 border rounded text-xs">
                                 <option>快充</option>
                                 <option>超充</option>
                                 <option>慢充</option>
                                 <option>混用</option>
                              </select>
                           </td>
                           <td className="p-2">
                              <input type="number" step="0.01" value={c.price} onChange={e => updateCompetitor(c.id, 'price', Number(e.target.value))} className="w-16 p-1 border rounded text-center text-emerald-600 font-bold" />
                           </td>
                           <td className="p-2 text-center">
                              <button onClick={() => removeCompetitor(c.id)} className="text-slate-300 hover:text-red-500">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

    </div>
  );
};

export default SiteEvalView;