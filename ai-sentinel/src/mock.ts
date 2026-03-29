import { generateNewsletter } from './generator';
import * as path from 'path';

async function main() {
  console.log('🧪 Starting AI Sentinel (MOCK RUN)...');

  const mockArticles = [
    {
      title: "Gemini 1.5 Pro: A New Milestone in Large Language Models",
      link: "https://blog.google/technology/ai/google-gemini-pro-1-5/",
      source: "Google DeepMind",
      summary: "GoogleがGemini 1.5 Proを発表しました。100万トークンのコンテキストウィンドウを搭載し、膨大な情報処理が可能です。\n\n📊 **注目ポイント**\n- 100万トークンの超長文対応\n- 複雑な推論とコーディング能力の向上\n- モダリティを横断した高度な理解\n\n💡 **アクション**\n開発者の方は、Google AI Studioで新しいコンテキストの限界を試してみてください。"
    },
    {
      title: "Introducing Sora: Creating Video from Text",
      link: "https://openai.com/sora",
      source: "OpenAI Blog",
      summary: "OpenAIが動画生成AI『Sora』を発表。テキストから最大1分間のリアルな動画を生成します。\n\n📊 **注目ポイント**\n- 物理法則をシミュレートした高品質動画\n- 複雑なシーンやキャラクター表現の実現\n- 安全性とフェイク対策への注力\n\n💡 **アクション**\n生成される動画のサンプルをチェックし、将来の動画制作ワークフローの変化を構想しましょう。"
    }
  ];

  const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const outputFilePath = path.join(__dirname, '..', 'newsletter-preview.html');
  
  await generateNewsletter({
    title: `AI Sentinel - Pre-launch Preview`,
    niche: "AI News & Tools",
    articles: mockArticles,
    date: dateStr
  }, outputFilePath);

  console.log('✅ Mock run complete! Please check newsletter-preview.html');
}

main().catch(console.error);
