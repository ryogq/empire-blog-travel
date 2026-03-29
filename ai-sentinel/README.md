# AI Sentinel

Automated AI News & Tools Newsletter.

## How it works
1. Scrapes RSS feeds from OpenAI, Google DeepMind, TechCrunch AI, and Hugging Face.
2. Filters out previously seen articles.
3. Summarizes the top 5 new articles using Gemini API (Gemini-1.5-flash).
4. Generates a premium-designed HTML newsletter (`newsletter.html`).

## Prerequisite
Set `GEMINI_API_KEY` in your environment or a `.env` file in this directory.

## Run
```bash
npm start
```
