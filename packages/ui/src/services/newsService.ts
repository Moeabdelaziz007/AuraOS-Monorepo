export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'ai' | 'crypto';
  sentiment?: 'positive' | 'neutral' | 'negative';
  imageUrl?: string;
}

interface NewsAPIResponse {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    source: { name: string };
    publishedAt: string;
    urlToImage?: string;
  }>;
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const NEWS_API_BASE = 'https://newsapi.org/v2';

// Fallback to mock data if API key is not available
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Revolutionary Capabilities',
    description: 'OpenAI unveils GPT-5, featuring enhanced reasoning and multimodal understanding that surpasses previous models.',
    url: 'https://example.com/gpt5-announcement',
    source: 'TechCrunch',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'ai',
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Bitcoin Surges Past $50,000 Mark',
    description: 'Bitcoin reaches new heights as institutional investors show renewed interest in cryptocurrency markets.',
    url: 'https://example.com/bitcoin-surge',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: 'crypto',
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Google DeepMind Achieves Breakthrough in Protein Folding',
    description: 'AlphaFold 3 demonstrates unprecedented accuracy in predicting complex protein structures.',
    url: 'https://example.com/alphafold3',
    source: 'Nature',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'ai',
    sentiment: 'positive',
  },
  {
    id: '4',
    title: 'Ethereum 2.0 Upgrade Shows Promising Results',
    description: 'The latest Ethereum upgrade demonstrates significant improvements in transaction speed and energy efficiency.',
    url: 'https://example.com/ethereum-upgrade',
    source: 'CryptoNews',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'crypto',
    sentiment: 'positive',
  },
  {
    id: '5',
    title: 'AI Regulation Debate Intensifies in Congress',
    description: 'Lawmakers discuss new frameworks for AI governance as concerns about safety and ethics grow.',
    url: 'https://example.com/ai-regulation',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    category: 'ai',
    sentiment: 'neutral',
  },
  {
    id: '6',
    title: 'Major Exchange Reports Security Breach',
    description: 'A leading cryptocurrency exchange temporarily halts trading after detecting suspicious activity.',
    url: 'https://example.com/exchange-breach',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'crypto',
    sentiment: 'negative',
  },
  {
    id: '7',
    title: 'Meta Releases Open-Source AI Model',
    description: 'Meta makes its latest large language model available to researchers and developers worldwide.',
    url: 'https://example.com/meta-opensource',
    source: 'The Verge',
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    category: 'ai',
    sentiment: 'positive',
  },
  {
    id: '8',
    title: 'DeFi Platform Launches Innovative Yield Strategy',
    description: 'New decentralized finance protocol offers competitive returns with enhanced security features.',
    url: 'https://example.com/defi-yield',
    source: 'DeFi Pulse',
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    category: 'crypto',
    sentiment: 'positive',
  },
];

async function fetchNewsFromAPI(category: 'ai' | 'crypto'): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('News API key not configured, using mock data');
    return mockNews.filter(article => article.category === category);
  }

  const query = category === 'ai' ? 'artificial intelligence OR machine learning OR AI' : 'cryptocurrency OR bitcoin OR ethereum OR blockchain';
  const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();
    
    return data.articles.map((article, index) => ({
      id: `${category}-${index}-${Date.now()}`,
      title: article.title,
      description: article.description || 'No description available',
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      category,
      imageUrl: article.urlToImage,
      sentiment: determineSentiment(article.title + ' ' + article.description),
    }));
  } catch (error) {
    console.error(`Failed to fetch ${category} news:`, error);
    return mockNews.filter(article => article.category === category);
  }
}

function determineSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['surge', 'breakthrough', 'success', 'innovative', 'growth', 'gains', 'bullish', 'upgrade', 'achievement'];
  const negativeWords = ['breach', 'crash', 'decline', 'concern', 'risk', 'warning', 'bearish', 'loss', 'failure'];
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    const [aiNews, cryptoNews] = await Promise.all([
      fetchNewsFromAPI('ai'),
      fetchNewsFromAPI('crypto'),
    ]);
    
    return [...aiNews, ...cryptoNews].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return mockNews;
  }
}

export async function fetchNewsByCategory(category: 'ai' | 'crypto'): Promise<NewsArticle[]> {
  return fetchNewsFromAPI(category);
}

export function getMockNews(): NewsArticle[] {
  return mockNews;
}
