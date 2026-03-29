import { generateNewsletter } from './generator.js';
import { publishToBeehiiv, publishToResend } from './publisher.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🧪 Starting AI Sentinel (MOCK PUBLISH RUN)...');

  const mockArticles = [
    {
      title: "Gemini 1.5 Pro: A New Milestone in Large Language Models",
      link: "https://blog.google/technology/ai/google-gemini-pro-1-5/",
      source: "Google DeepMind",
      summary: "GoogleがGemini 1.5 Proを発表しました。100万トークンのコンテキストウィンドウを搭載し、膨大な情報処理が可能です。\n\n📊 **注目ポイント**\n- 100万トークンの超長文対応\n- 複雑な推論とコーディング能力の向上\n- モダリティを横断した高度な理解\n\n💡 **アクション**\n開発者の方は、Google AI Studioで新しいコンテキストの限界を試してみてください。"
    }
  ];

  const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const outputFilePath = path.join(__dirname, '..', 'newsletter-preview.html');
  
  const newsletterData = {
    title: `AI Sentinel - Distribution Preview`,
    niche: "AI News & Tools",
    articles: mockArticles,
    date: dateStr
  };

  await generateNewsletter(newsletterData, outputFilePath);
  
  // Try publishing with fake keys (it should gracefully warn or error without crashing)
  console.log('\n--- Testing Publisher Integration ---');
  await publishToBeehiiv(newsletterData.title, "Mock Content");
  
  console.log('\n✅ Mock publish run complete!');
}

main().catch(console.error);
