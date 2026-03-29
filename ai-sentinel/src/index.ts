import * as fs from 'fs';
import * as path from 'path';
import { fetchArticles } from './fetcher.js';
import { summarizeArticles, selectAffiliate } from './summarizer.js';
import { generateNewsletter } from './generator.js';
import { publishToBeehiiv, publishToResend, publishToBlog } from './publisher.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const configPath = path.join(__dirname, '..', 'config.json');
  const dbPath = path.join(__dirname, '..', 'db.json');
  const affiliatePath = path.join(__dirname, '..', 'affiliates.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Load seen URLs
  let seenUrls = new Set<string>();
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    seenUrls = new Set(data.seenUrls || []);
  }

  // 1. Fetch
  console.log('🚀 Starting AI Sentinel...');
  const allArticles = await fetchArticles(config.sources);

  // 2. Filter (new only)
  const newArticles = allArticles.filter(a => a.link && !seenUrls.has(a.link)).slice(0, 1); 

  if (newArticles.length === 0) {
    console.log('No new articles found. Exiting.');
    return;
  }

  console.log(`Found ${newArticles.length} new articles.`);

  // 3. Summarize
  const summarized = await summarizeArticles(newArticles, config.niche, config.language);

  // 4. Select Affiliate
  const affiliates = JSON.parse(fs.readFileSync(affiliatePath, 'utf8'));
  const selectedAffiliate = await selectAffiliate(summarized, affiliates, config.language);

  // 5. Generate
  const dateStr = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const outputFilePath = path.join(__dirname, '..', 'newsletter.html');
  
  const newsletterData = {
    title: `${config.niche} - ${dateStr}`,
    niche: config.niche,
    articles: summarized,
    affiliate: selectedAffiliate,
    date: dateStr
  };

  await generateNewsletter(newsletterData, outputFilePath);

  // 6. Publish
  const htmlContent = fs.readFileSync(outputFilePath, 'utf8');
  
  // Blog publishing (Local file writing for Astro)
  await publishToBlog(newsletterData.title, summarized, selectedAffiliate);

  // Try Beehiiv as a secondary option
  await publishToBeehiiv(newsletterData.title, htmlContent);
  
  // Primary Zero-Cost option: Resend to subscriber list
  const subPath = path.join(__dirname, '..', 'subscribers.json');
  if (fs.existsSync(subPath)) {
    const { subscribers } = JSON.parse(fs.readFileSync(subPath, 'utf8'));
    console.log(`📪 Sending to ${subscribers.length} subscribers...`);
    
    for (const email of subscribers) {
      if (email === 'your-email@example.com') continue; // Skip placeholder
      if (process.env.RESEND_TO_EMAIL || true) { // Force check for subscribers
        await publishToResend(
          'AI Sentinel <onboarding@resend.dev>',
          email,
          newsletterData.title,
          htmlContent
        );
      }
    }
  }

  // Update DB
  newArticles.forEach(a => {
    if (a.link) seenUrls.add(a.link);
  });
  fs.writeFileSync(dbPath, JSON.stringify({ seenUrls: Array.from(seenUrls) }, null, 2));

  console.log('✅ AI Sentinel process complete!');
  process.exit(0); // 強制終了（これがないと非同期処理の残骸で止まることがある）
}

main().catch(console.error);
