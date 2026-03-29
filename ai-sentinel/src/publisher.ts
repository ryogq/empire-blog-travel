import axios from 'axios';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

interface BeehiivConfig {
  apiKey: string;
  publicationId: string;
}

interface ResendConfig {
  apiKey: string;
}

export async function publishToBeehiiv(title: string, htmlContent: string) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    console.warn('⚠️ Beehiiv API key or Publication ID missing. Skipping publisher.');
    return;
  }

  const url = `https://api.beehiiv.com/v2/publications/${publicationId}/posts`;

  try {
    console.log('📤 Publishing draft to Beehiiv...');
    const response = await axios.post(
      url,
      {
        title: title,
        body_content: htmlContent,
        status: 'draft',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Post created in Beehiiv! Draft ID: ${response.data.data.id}`);
  } catch (error: any) {
    console.error('❌ Failed to publish to Beehiiv:', error.response?.data || error.message);
  }
}

export async function publishToResend(from: string, to: string, subject: string, htmlContent: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Resend API key missing. Skipping publisher.');
    return;
  }

  const url = 'https://api.resend.com/emails';

  try {
    console.log('📧 Sending email via Resend...');
    const response = await axios.post(
      url,
      {
        from: from,
        to: [to],
        subject: subject,
        html: htmlContent,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Email sent via Resend! ID: ${response.data.id}`);
  } catch (error: any) {
    console.error('❌ Failed to send via Resend:', error.response?.data || error.message);
  }
}

export async function publishToBlog(title: string, articles: any[], affiliate: any) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  // Monorepo: ai-sentinel is inside ai-blog. To get to ai-blog/src/content/blog, go up two levels.
  const blogDir = path.join(__dirname, '..', '..', 'src', 'content', 'blog');
  const filePath = path.join(blogDir, `${dateStr}.md`);

  if (!fs.existsSync(blogDir)) {
    console.warn(`⚠️ Blog content directory not found: ${blogDir}. Skipping blog publish.`);
    return;
  }

  // Generate SEO-friendly description from first article
  const description = articles[0]?.summary.substring(0, 150) + '...' || '今日のAIニュースまとめ';

  // Format Markdown with Frontmatter for Astro
  const content = `---
title: "${title}"
description: "${description.replace(/"/g, "'")}"
pubDate: "${dateStr}"
heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"
affiliate:
  name: "${affiliate.name}"
  url: "${affiliate.url}"
  recommendation: "${affiliate.recommendation.replace(/"/g, "'")}"
---

${articles.map(a => `
## 🚀 [${a.title}](${a.link})

${a.summary}
`).join('\n\n')}

---

## 💡 今日の注目ツール: ${affiliate.name}
${affiliate.recommendation}

[詳細をチェック →](${affiliate.url})
`;

  try {
    fs.writeFileSync(filePath, content);
    console.log(`📝 Blog post generated: ${filePath}`);

    // Fully Automated CI/CD: Push to GitHub -> Trigger Vercel Deploy
    // Skip this if running inside GitHub Actions (the CI workflow will handle committing via stefanzweifel/git-auto-commit-action)
    if (!process.env.GITHUB_ACTIONS) {
      console.log('🤖 Pushing new post to GitHub for Vercel deployment (Local Mode)...');
      try {
        // Find the root of the blog directory (Monorepo: two levels up)
        const blogRootDir = path.join(__dirname, '..', '..');
        execSync('git add .', { cwd: blogRootDir, stdio: 'inherit' });
        execSync(`git commit -m "Auto-post: AI Sentinel - ${dateStr}"`, { cwd: blogRootDir, stdio: 'inherit' });
        execSync('git push origin main', { cwd: blogRootDir, stdio: 'inherit' });
        console.log('✅ Successfully pushed to GitHub. Vercel deployment triggered!');
      } catch (gitError: any) {
        console.error('❌ Failed to push to GitHub. (Did you authenticate via gh auth login?):', gitError.message);
      }
    } else {
      console.log('☁️ Running in GitHub Actions: Skipping local git push (Workflow handles committing).');
    }
  } catch (error: any) {
    console.error('❌ Failed to write blog post:', error.message);
  }
}
