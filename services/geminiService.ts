import { GoogleGenAI } from "@google/genai";
import { AI_MODEL_TEXT } from "../constants";
import { ProjectData } from "../types";

const apiKey = process.env.API_KEY || ''; 
// Note: In a real prod env, never expose key in frontend. 
// For this instruction-based task, we assume process.env.API_KEY is available.

const ai = new GoogleGenAI({ apiKey });

export const generateFeasibilityReport = async (data: ProjectData, metrics: any): Promise<string> => {
  if (!apiKey) {
    return "Error: API_KEY not found in environment variables.";
  }

  const prompt = `
    作为一位专业的充电站投资分析师，请根据以下项目数据生成一份精简但专业的投资可行性报告摘要。
    
    **输出要求：**
    1. 使用标准的 Markdown 格式。
    2. 使用小标题 (#, ##) 区分章节。
    3. 使用列表 (-) 展示数据。
    4. 重点加粗 (**Bold**) 关键结论。
    5. 语气专业、客观。

    **项目数据：**
    - 项目名称: ${data.projectName}
    - 选址评分 (10分制): 交通便利度 ${data.scoreTraffic}, 竞品情况 ${data.scoreCompetition}, 周边配套 ${data.scoreAmenities}
    - 区域需求: ${data.regionEnergyLevel === 'HIGH' ? '高需求' : data.regionEnergyLevel === 'MEDIUM' ? '中等需求' : '低需求'}
    - 合作模式: ${data.rentType === 'fixed' ? `固定租金 (${data.rentAnnual}元/年)` : `流水抽成 (${data.rentSharePercent}%)`}
    
    **关键财务指标:**
    - 总投资 (CAPEX): ${metrics.totalInvestment.toLocaleString()} 元 (单瓦造价: ${metrics.avgCostPerWatt.toFixed(2)}元/W)
    - 预计年收入: ${metrics.annualRevenue.toLocaleString()} 元
    - 预计年净利: ${metrics.annualProfit.toLocaleString()} 元
    - 静态回收期: ${metrics.paybackPeriod === 99 ? '> 10' : metrics.paybackPeriod.toFixed(1)} 年
    - 10年内部收益率 (IRR): ${metrics.irr}%
    - 盈亏平衡利用率: ${metrics.breakEvenUtilization.toFixed(1)}% (当前预计: ${metrics.utilizationPercent.toFixed(1)}%)

    请撰写报告，包含以下章节：
    ## 1. 项目概述
    ## 2. 投资回报分析 (重点分析回收期和IRR)
    ## 3. 风险提示 (基于竞品和利用率)
    ## 4. 最终建议
  `;

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text || "无法生成报告内容。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成报告时发生错误，请检查网络或API配置。";
  }
};