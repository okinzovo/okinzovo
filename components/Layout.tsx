
import React from 'react';
import { AppView } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { LayoutGrid, Map, Briefcase, BatteryCharging, Download, Database } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const { data, metrics } = useProject();

  const navItems = [
    { id: AppView.SITE_EVALUATION, label: '选址评估', icon: Map },
    { id: AppView.NEGOTIATION, label: '商务拓展', icon: Briefcase },
    { id: AppView.FINANCIALS, label: '投资测算', icon: LayoutGrid },
  ];

  const handleExportData = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const projectNameSafe = data.projectName.replace(/\s+/g, '_') || 'project';

    // 1. Export JSON (Config)
    const jsonString = JSON.stringify(data, null, 2);
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = `${projectNameSafe}_config_${timestamp}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);

    // 2. Export XLS (XML Spreadsheet 2003)
    // Helper to escape XML characters
    const escapeXml = (unsafe: any): string => {
        if (unsafe === null || unsafe === undefined) return '';
        const str = String(unsafe);
        return str.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const createCell = (val: any, type: 'String' | 'Number' = 'String') => 
      `<Cell><Data ss:Type="${type}">${escapeXml(val)}</Data></Cell>`;
    
    const createRow = (cells: string[]) => 
      `<Row>${cells.join('')}</Row>`;

    // --- Sheet 1: Project Overview ---
    let sheet1Rows = '';
    sheet1Rows += createRow([createCell('项目基础信息'), createCell('')]);
    sheet1Rows += createRow([createCell('项目名称'), createCell(data.projectName)]);
    sheet1Rows += createRow([createCell('项目地址'), createCell(data.address)]);
    sheet1Rows += createRow([createCell('电力容量 (kVA)'), createCell(data.availableCapacity, 'Number')]);
    sheet1Rows += createRow([createCell('区域需求等级'), createCell(data.regionEnergyLevel)]);
    sheet1Rows += createRow([createCell('合作模式'), createCell(data.rentType === 'fixed' ? '固定租金' : '流水分成')]);
    
    sheet1Rows += createRow([]);
    sheet1Rows += createRow([createCell('充电桩配置清单')]);
    sheet1Rows += createRow([createCell('桩型名称'), createCell('单桩功率(kW)'), createCell('数量(台)'), createCell('合计功率(kW)')]);
    data.stations.forEach(s => {
      sheet1Rows += createRow([
          createCell(s.name), 
          createCell(s.power, 'Number'), 
          createCell(s.count, 'Number'),
          createCell(s.power * s.count, 'Number')
      ]);
    });

    sheet1Rows += createRow([]);
    sheet1Rows += createRow([createCell('周边竞品信息')]);
    sheet1Rows += createRow([createCell('运营商/站名'), createCell('数量'), createCell('枪型'), createCell('价格(元)')]);
    data.competitors.forEach(c => {
      sheet1Rows += createRow([
          createCell(`${c.operator} - ${c.name}`), 
          createCell(c.count, 'Number'), 
          createCell(c.gunType),
          createCell(c.price, 'Number')
      ]);
    });

    // --- Sheet 2: Financial Metrics ---
    let sheet2Rows = '';
    sheet2Rows += createRow([createCell('核心财务指标')]);
    sheet2Rows += createRow([createCell('总投资 (元)'), createCell(metrics.totalInvestment, 'Number')]);
    sheet2Rows += createRow([createCell('单瓦造价 (元/W)'), createCell(metrics.avgCostPerWatt, 'Number')]);
    sheet2Rows += createRow([createCell('预计年营收 (元)'), createCell(metrics.annualRevenue, 'Number')]);
    sheet2Rows += createRow([createCell('预计年净利 (元)'), createCell(metrics.annualProfit, 'Number')]);
    sheet2Rows += createRow([createCell('静态回收期 (年)'), createCell(metrics.paybackPeriod, 'Number')]);
    sheet2Rows += createRow([createCell('内部收益率 IRR (%)'), createCell(metrics.irr, 'Number')]);
    sheet2Rows += createRow([createCell('盈亏平衡利用率 (%)'), createCell(metrics.breakEvenUtilization, 'Number')]);
    sheet2Rows += createRow([createCell('当前预测利用率 (%)'), createCell(metrics.utilizationPercent, 'Number')]);
    
    sheet2Rows += createRow([]);
    sheet2Rows += createRow([createCell('投资成本明细 (CAPEX)')]);
    sheet2Rows += createRow([createCell('充电设备费'), createCell(metrics.costPiles, 'Number')]);
    sheet2Rows += createRow([createCell('变压器费用'), createCell(metrics.costTransformer, 'Number')]);
    sheet2Rows += createRow([createCell('配电设施费'), createCell(metrics.costDistribution, 'Number')]);
    sheet2Rows += createRow([createCell('其他固定费用'), createCell(metrics.costOthers, 'Number')]);
    sheet2Rows += createRow([createCell('CAPEX 总计'), createCell(metrics.totalInvestment, 'Number')]);

    sheet2Rows += createRow([]);
    sheet2Rows += createRow([createCell('运营成本参数 (OPEX)')]);
    sheet2Rows += createRow([createCell('综合购电价 (元/度)'), createCell(metrics.weightedBuyPrice, 'Number')]);
    sheet2Rows += createRow([createCell('综合服务费 (元/度)'), createCell(metrics.weightedServiceFee, 'Number')]);
    sheet2Rows += createRow([createCell('年售电量 (度)'), createCell(metrics.annualEnergyOutput, 'Number')]);
    sheet2Rows += createRow([createCell('年线损电量 (度)'), createCell(metrics.annualEnergyInput - metrics.annualEnergyOutput, 'Number')]);

    // --- Sheet 3: Cash Flow ---
    let sheet3Rows = '';
    sheet3Rows += createRow([createCell('年份'), createCell('当年净利润 (元)'), createCell('累计现金流 (元)')]);
    sheet3Rows += createRow([createCell('Year 0 (投资期)'), createCell(-metrics.totalInvestment, 'Number'), createCell(-metrics.totalInvestment, 'Number')]);
    metrics.cashFlow.slice(1).forEach((val, idx) => {
      sheet3Rows += createRow([
          createCell(`Year ${idx + 1}`), 
          createCell(val, 'Number'), 
          createCell(metrics.cumulativeCashFlow[idx + 1], 'Number')
      ]);
    });

    const workbookBody = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
 </Styles>
 <Worksheet ss:Name="项目概览">
  <Table x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="60" ss:DefaultRowHeight="15">
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   <Column ss:AutoFitWidth="0" ss:Width="150"/>
   <Column ss:AutoFitWidth="0" ss:Width="80"/>
   <Column ss:AutoFitWidth="0" ss:Width="100"/>
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="财务分析">
  <Table x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="60" ss:DefaultRowHeight="15">
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   ${sheet2Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="现金流表">
  <Table x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="60" ss:DefaultRowHeight="15">
   <Column ss:AutoFitWidth="0" ss:Width="80"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   ${sheet3Rows}
  </Table>
 </Worksheet>
</Workbook>`;

    const xlsBlob = new Blob([workbookBody], { type: "application/vnd.ms-excel" });
    const xlsUrl = URL.createObjectURL(xlsBlob);
    const xlsLink = document.createElement("a");
    xlsLink.href = xlsUrl;
    xlsLink.download = `${projectNameSafe}_analysis_${timestamp}.xls`;
    document.body.appendChild(xlsLink);
    xlsLink.click();
    document.body.removeChild(xlsLink);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">EvCharge Pro</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-primary text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center">
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                title="导出项目配置(JSON)和分析数据(XLS)"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">导出数据</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Bar (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 flex justify-around py-2 pb-safe no-print">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-primary' : 'text-slate-500'}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 md:mb-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
