import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function summarizeArticles(articles: any[], niche: string, language: string) {
  const summarizedArticles = [];

  for (const article of articles) {
    console.log(`Summarizing: ${article.title.substring(0, 50)}...`);
    
    let attempts = 0;
    let summaryText = "要約の生成に失敗しました。";

    while (attempts < 5) { // 5 retries
      try {
        await delay(60000); // 60s safety delay

        const prompt = `
          Summarize this article for a ${niche} enthusiast in ${language}.
          Title: ${article.title}
          Content: ${article.contentSnippet || article.content}
          
          Provide a 3-sentence summary in ${language}.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        summaryText = response.text();
        
        if (summaryText && summaryText.length > 5) {
            break; 
        }
        throw new Error("Empty summary");
      } catch (error: any) {
        attempts++;
        if (error.status === 429 || error.message?.includes('429')) {
          console.warn(`[429] Rate limit hit. Waiting 125s... (Attempt ${attempts})`);
          await delay(125000);
        } else {
          console.error(`Error: ${article.title}`, error.message);
          await delay(5000);
        }
      }
    }

    summarizedArticles.push({
      ...article,
      summary: summaryText
    });
  }

  return summarizedArticles;
}

export async function selectAffiliate(summaries: any[], affiliates: any[], language: string) {
  try {
    const titles = summaries.map(s => s.title).join('\n');
    const tools = affiliates.map(a => `${a.name}: ${a.description}`).join('\n');

    const prompt = `
      Select one tool:
      News: ${titles}
      Tools: ${tools}
      Return JSON: {"selected_id": "id", "recommendation": "comment in ${language}"}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);

    const tool = affiliates.find(a => a.id === data.selected_id) || affiliates[0];
    return { ...tool, recommendation: data.recommendation };
  } catch (error) {
    console.error("Affiliate selection error:", error);
    return { ...affiliates[0], recommendation: "今週の注目ツールをご紹介します。" };
  }
}
