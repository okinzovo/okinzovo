import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { generateFeasibilityReport } from '../services/geminiService';
import { FileText, Handshake, Download, Loader2, RefreshCw, Printer, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const NegotiationView: React.FC = () => {
  const { data, updateData, metrics } = useProject();
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await generateFeasibilityReport(data, metrics);
    setReport(result);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.projectName}_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ownerRevenue = data.rentType === 'fixed' 
    ? data.rentAnnual 
    : metrics.annualRevenue * (data.rentSharePercent / 100);

  const companyRevenue = metrics.annualRevenue - ownerRevenue;

  return (
    <div className="space-y-6 animate-fade-in">
        
        {/* Main Content Area - Visible on Screen, Hidden on Print via 'no-print' class in wrapper if needed, 
            but here we apply it to specific containers or use the global CSS class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
           
           {/* Card 1: Deal Structure */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Handshake className="w-5 h-5 mr-2 text-primary" />
                商务合作模拟
              </h3>
              
              <div className="mb-6">
                 <label className="block text-sm font-medium text-slate-700 mb-2">合作模式</label>
                 <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => updateData({ rentType: 'revenue_share' })}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${data.rentType === 'revenue_share' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      流水分成
                    </button>
                    <button 
                      onClick={() => updateData({ rentType: 'fixed' })}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${data.rentType === 'fixed' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      固定租金
                    </button>
                 </div>
              </div>

              {data.rentType === 'revenue_share' ? (
                <div className="mb-6">
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-600">业主分成比例</span>
                     <span className="font-bold text-slate-900">{data.rentSharePercent}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max="50" 
                     step="1"
                     value={data.rentSharePercent}
                     onChange={(e) => updateData({ rentSharePercent: Number(e.target.value) })}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                   />
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">年租金 (元)</label>
                  <input 
                     type="number" 
                     value={data.rentAnnual}
                     onChange={(e) => updateData({ rentAnnual: Number(e.target.value) })}
                     className="w-full p-2 border border-slate-300 rounded focus:border-primary outline-none"
                   />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">业主预计年收</span>
                    <span className="font-bold text-slate-800">¥ {(ownerRevenue / 10000).toFixed(2)} 万</span>
                 </div>
                 <div className="w-full h-px bg-slate-200"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">我方留存营收</span>
                    <span className="font-bold text-primary">¥ {(companyRevenue / 10000).toFixed(2)} 万</span>
                 </div>
                 <div className="text-xs text-slate-400 text-right">
                   * 未扣除运维、购电成本
                 </div>
              </div>
           </div>

           {/* Card 2: Terms & AI Actions */}
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">核心谈判条款清单</h3>
                <ul className="space-y-3">
                  {[
                    '排他性条款：周边3公里内不得引入竞品',
                    '免租期：建设期及运营首月免租',
                    '电力扩容：业主协助办理，费用由我方承担',
                    '合约期限：建议 8-10 年以覆盖回本期',
                    '优先续约权：同等条件下拥有优先续约权'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
             </div>

             {/* AI Report Actions Card */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                   <FileText className="w-5 h-5 text-indigo-600" />
                   <h3 className="font-semibold text-slate-800">AI 智能投资报告</h3>
                </div>
                
                <div className="space-y-4">
                   <p className="text-sm text-slate-500">
                     基于当前投资测算数据，自动生成专业的项目可行性分析报告。
                   </p>
                   
                   <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {loading ? '撰写中...' : (report ? '重新生成' : '生成报告')}
                      </button>
                      
                      {report && (
                        <>
                           <button 
                              onClick={handleDownloadReport}
                              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                              title="下载 Markdown 文件"
                           >
                              <Download className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={handlePrint}
                              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                              title="打印 / 另存为 PDF"
                           >
                              <Printer className="w-4 h-4" />
                           </button>
                        </>
                      )}
                   </div>
                   
                   {report && !loading && (
                     <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-2 rounded border border-emerald-100">
                        <CheckCircle className="w-4 h-4" />
                        报告已生成，可下载或打印。
                     </div>
                   )}
                </div>
             </div>
           </div>
        </div>

        {/* Hidden Report Container - ONLY Visible when Printing */}
        <div className="hidden print:block print-content bg-white p-8">
            <div className="prose prose-slate max-w-none">
              <h1 className="text-2xl font-bold mb-4 border-b pb-2">{data.projectName} - 投资可行性报告</h1>
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
        </div>

    </div>
  );
};

export default NegotiationView;