import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Sparkles, 
  Bitcoin, 
  RefreshCw, 
  ExternalLink,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Filter
} from 'lucide-react';
import { fetchAllNews, fetchNewsByCategory, getMockNews, type NewsArticle } from '../services/newsService';

export const NewsDashboardApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'crypto' | 'all'>('all');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const fetchedNews = await fetchAllNews();
      setNews(fetchedNews);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load news:', error);
      setNews(getMockNews());
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      let fetchedNews: NewsArticle[];
      if (activeTab === 'all') {
        fetchedNews = await fetchAllNews();
      } else {
        fetchedNews = await fetchNewsByCategory(activeTab);
      }
      setNews(fetchedNews);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(article => {
    if (activeTab === 'all') return true;
    return article.category === activeTab;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                News Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Live updates on AI & Crypto
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>Updated {getTimeAgo(lastUpdated.toISOString())}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNews}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="gap-2">
              <Filter className="h-4 w-4" />
              All News
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="crypto" className="gap-2">
              <Bitcoin className="h-4 w-4" />
              Crypto
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* News Grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Loading latest news...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredNews.map((article) => (
              <Card 
                key={article.id} 
                className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800"
              >
                {article.imageUrl && (
                  <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${article.category === 'ai' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-orange-500 hover:bg-orange-600'} text-white shadow-lg transition-colors`}>
                        {article.category === 'ai' ? (
                          <><Sparkles className="h-3 w-3 mr-1" /> AI</>
                        ) : (
                          <><Bitcoin className="h-3 w-3 mr-1" /> Crypto</>
                        )}
                      </Badge>
                      {article.sentiment && (
                        <Badge variant="outline" className={getSentimentColor(article.sentiment)}>
                          {getSentimentIcon(article.sentiment)} {article.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{getTimeAgo(article.publishedAt)}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                        <span className="text-xs">Read</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-8 gap-1 text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      <span className="text-xs font-medium">Read more</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredNews.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No news articles found</p>
              <Button variant="outline" size="sm" onClick={refreshNews} className="mt-3">
                Refresh News
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 dark:text-slate-400">Live</span>
            </div>
            <span className="text-slate-600 dark:text-slate-400">
              {filteredNews.length} articles
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-500 text-xs">
            Powered by AuraOS News API
          </div>
        </div>
      </div>
    </div>
  );
};
