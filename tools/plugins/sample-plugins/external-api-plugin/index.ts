import { Plugin, PluginAPI } from '@selfos/plugin-sdk';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ExternalAPIConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: number;
  timeout: number;
  retryAttempts: number;
}

export interface APICache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

export class ExternalAPIPlugin implements Plugin {
  name = 'external-api-plugin';
  version = '1.0.0';
  description = 'External API integration plugin with caching and rate limiting';

  private api: PluginAPI;
  private config: ExternalAPIConfig;
  private apiClient: AxiosInstance;
  private cache: APICache = {};
  private rateLimiter: Map<string, number[]> = new Map();

  constructor(config: ExternalAPIConfig, api: PluginAPI) {
    this.config = config;
    this.api = api;

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SelfOS-Plugin/1.0.0'
      }
    });

    // Add request interceptor for rate limiting
    this.apiClient.interceptors.request.use(
      async (config) => {
        await this.checkRateLimit(config.url || '');
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for caching
    this.apiClient.interceptors.response.use(
      (response) => {
        this.cacheResponse(response.config.url || '', response.data);
        return response;
      },
      (error) => {
        // Retry logic
        if (error.response?.status >= 500 && this.config.retryAttempts > 0) {
          return this.retryRequest(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async initialize(): Promise<void> {
    logger.info('External API Plugin initialized');

    // Register API commands
    this.api.registerCommand('api:get', {
      description: 'Get data from external API',
      handler: async (args: string[]) => {
        if (args.length === 0) {
          return 'Usage: api:get <endpoint>';
        }

        try {
          const endpoint = args[0];
          const cachedData = this.getCachedData(endpoint);
          if (cachedData) {
            return `Cached data: ${JSON.stringify(cachedData, null, 2)}`;
          }

          const response = await this.apiClient.get(endpoint);
          return `API Response: ${JSON.stringify(response.data, null, 2)}`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      }
    });

    this.api.registerCommand('api:post', {
      description: 'Post data to external API',
      handler: async (args: string[]) => {
        if (args.length < 2) {
          return 'Usage: api:post <endpoint> <data>';
        }

        try {
          const [endpoint, ...dataParts] = args;
          const data = JSON.parse(dataParts.join(' '));

          const response = await this.apiClient.post(endpoint, data);
          return `API Response: ${JSON.stringify(response.data, null, 2)}`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      }
    });

    this.api.registerCommand('api:cache:clear', {
      description: 'Clear API cache',
      handler: async () => {
        this.cache = {};
        return 'API cache cleared';
      }
    });

    this.api.registerCommand('api:status', {
      description: 'Get API plugin status',
      handler: async () => {
        return {
          name: this.name,
          version: this.version,
          config: {
            baseUrl: this.config.baseUrl,
            rateLimit: this.config.rateLimit,
            timeout: this.config.timeout
          },
          cache: {
            size: Object.keys(this.cache).length,
            keys: Object.keys(this.cache)
          },
          rateLimiter: {
            activeLimits: this.rateLimiter.size
          }
        };
      }
    });

    // Register UI component for API testing
    this.api.registerApp({
      name: 'API Tester',
      icon: 'api',
      component: this.createAPITesterComponent(),
      category: 'development'
    });

    // Load cached data from storage
    await this.loadCacheFromStorage();
  }

  async destroy(): Promise<void> {
    // Save cache to storage
    await this.api.storage.set('api-cache', this.cache);
    logger.info('External API Plugin destroyed');
  }

  private async checkRateLimit(url: string): Promise<void> {
    const now = Date.now();
    const minuteAgo = now - 60000;

    if (!this.rateLimiter.has(url)) {
      this.rateLimiter.set(url, []);
    }

    const requests = this.rateLimiter.get(url)!;

    // Remove old requests
    const recentRequests = requests.filter(time => time > minuteAgo);
    this.rateLimiter.set(url, recentRequests);

    // Check if we're over the limit
    if (recentRequests.length >= this.config.rateLimit) {
      const waitTime = 60000 - (now - recentRequests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Add current request
    recentRequests.push(now);
    this.rateLimiter.set(url, recentRequests);
  }

  private cacheResponse(url: string, data: any): void {
    this.cache[url] = {
      data,
      timestamp: Date.now(),
      ttl: 300000 // 5 minutes
    };
  }

  private getCachedData(url: string): any | null {
    const cached = this.cache[url];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[url];
      return null;
    }

    return cached.data;
  }

  private async retryRequest(config: AxiosRequestConfig): Promise<any> {
    const retries = config.metadata?.retries || 0;

    if (retries >= this.config.retryAttempts) {
      throw new Error('Max retry attempts reached');
    }

    // Wait before retry (exponential backoff)
    const delay = Math.pow(2, retries) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    config.metadata = { ...config.metadata, retries: retries + 1 };
    return this.apiClient.request(config);
  }

  private async loadCacheFromStorage(): Promise<void> {
    try {
      const storedCache = await this.api.storage.get('api-cache');
      if (storedCache) {
        this.cache = storedCache;
      }
    } catch (error) {
      logger.warn('Failed to load cache from storage:', error);
    }
  }

  private createAPITesterComponent(): any {
    // This would be a React component in a real implementation
    return {
      name: 'APITester',
      props: {
        plugin: this
      }
    };
  }
}

export default ExternalAPIPlugin;
