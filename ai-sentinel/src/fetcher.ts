import Parser from 'rss-parser';

interface FeedSource {
  name: string;
  url: string;
}

export async function fetchArticles(sources: FeedSource[]) {
  const parser = new Parser();
  const allArticles = [];

  for (const source of sources) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const articles = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content,
        source: source.name
      }));
      
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  return allArticles;
}
