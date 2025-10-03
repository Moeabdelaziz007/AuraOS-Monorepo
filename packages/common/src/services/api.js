import axios from 'axios';
import DataAgent from './DataAgent';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initialize Data Agent (will be set when Firebase is available)
let dataAgent = null;

export const initializeDataAgent = (firestore, auth) => {
  dataAgent = new DataAgent(firestore, auth);
  return dataAgent;
};

export const getDataAgent = () => dataAgent;

// Enhanced Apps API with Data Agent integration
export const appsAPI = {
  // Get all apps with intelligent processing
  getAll: async (options = {}) => {
    if (dataAgent) {
      try {
        return await dataAgent.fetchData('apps', {
          ...options,
          useCache: true,
          processor: true
        });
      } catch (error) {
        logger.warn('Data Agent failed, falling back to direct API:', error);
      }
    }
    
    const response = await api.get('/apps');
    return response.data;
  },

  // Get single app by ID with enrichment
  getById: async (id, options = {}) => {
    if (dataAgent) {
      try {
        const apps = await dataAgent.fetchData('apps', {
          filters: [{ field: 'id', operator: '==', value: id }],
          ...options
        });
        return apps[0] || null;
      } catch (error) {
        logger.warn('Data Agent failed, falling back to direct API:', error);
      }
    }
    
    const response = await api.get(`/apps/${id}`);
    return response.data;
  },

  // Create new app with validation
  create: async (appData) => {
    const response = await api.post('/apps', appData);
    
    // Clear cache after creation
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Update app with cache invalidation
  update: async (id, appData) => {
    const response = await api.put(`/apps/${id}`, appData);
    
    // Clear cache after update
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Delete app with cache cleanup
  delete: async (id) => {
    const response = await api.delete(`/apps/${id}`);
    
    // Clear cache after deletion
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Toggle app status with intelligent processing
  toggleStatus: async (id, status) => {
    const response = await api.put(`/apps/${id}`, { status });
    
    // Clear cache after status change
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Batch operations for better performance
  batchCreate: async (appsData) => {
    if (dataAgent) {
      try {
        return await dataAgent.batchCreate('apps', appsData);
      } catch (error) {
        logger.warn('Data Agent batch create failed, falling back to individual creates:', error);
      }
    }
    
    const results = [];
    for (const appData of appsData) {
      try {
        const result = await appsAPI.create(appData);
        results.push(result);
      } catch (error) {
        results.push({ error: error.message, data: appData });
      }
    }
    return results;
  },

  // Get app analytics and insights
  getAnalytics: async (timeRange = '7d') => {
    if (dataAgent) {
      try {
        return await dataAgent.generateAnalyticsReport(timeRange);
      } catch (error) {
        logger.warn('Data Agent analytics failed:', error);
      }
    }
    
    // Fallback to basic analytics
    const apps = await appsAPI.getAll();
    return {
      totalApps: apps.length,
      activeApps: apps.filter(app => app.status === 'active').length,
      inactiveApps: apps.filter(app => app.status === 'inactive').length,
      categories: apps.reduce((acc, app) => {
        acc[app.category] = (acc[app.category] || 0) + 1;
        return acc;
      }, {})
    };
  },

  // Search apps with intelligent filtering
  search: async (query, options = {}) => {
    if (dataAgent) {
      try {
        const allApps = await dataAgent.fetchData('apps', {
          useCache: true,
          processor: true
        });
        
        return allApps.filter(app => 
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          app.description.toLowerCase().includes(query.toLowerCase()) ||
          app.category.toLowerCase().includes(query.toLowerCase())
        );
      } catch (error) {
        logger.warn('Data Agent search failed:', error);
      }
    }
    
    // Fallback to API search
    const response = await api.get(`/apps/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// Enhanced System API with Data Agent integration
export const systemAPI = {
  // Get system status with intelligent processing
  getStatus: async (options = {}) => {
    if (dataAgent) {
      try {
        const statusData = await dataAgent.fetchData('system', {
          ...options,
          useCache: true,
          processor: true
        });
        return statusData[0] || null;
      } catch (error) {
        logger.warn('Data Agent failed, falling back to direct API:', error);
      }
    }
    
    const response = await api.get('/system/status');
    return response.data;
  },

  // Get system logs with intelligent processing
  getLogs: async (options = {}) => {
    if (dataAgent) {
      try {
        return await dataAgent.fetchData('system_logs', {
          ...options,
          useCache: true,
          processor: true
        });
      } catch (error) {
        logger.warn('Data Agent failed, falling back to direct API:', error);
      }
    }
    
    const response = await api.get('/system/logs');
    return response.data;
  },

  // Create system log with intelligent categorization
  createLog: async (logData) => {
    const response = await api.post('/system/logs', logData);
    
    // Clear cache after log creation
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Get health status with enhanced monitoring
  getHealth: async () => {
    const response = await api.get('/health');
    
    // Enhance with data agent insights if available
    if (dataAgent) {
      try {
        const systemStatus = await dataAgent.fetchData('system');
        const enhancedHealth = {
          ...response.data,
          dataAgentStatus: 'active',
          cacheStatus: dataAgent.cache.size > 0 ? 'populated' : 'empty',
          subscriptions: dataAgent.subscriptions.size
        };
        return enhancedHealth;
      } catch (error) {
        logger.warn('Failed to enhance health data:', error);
      }
    }
    
    return response.data;
  },

  // Get configuration with intelligent defaults
  getConfig: async () => {
    const response = await api.get('/config');
    
    // Enhance with data agent configuration
    if (dataAgent) {
      return {
        ...response.data,
        dataAgent: {
          enabled: true,
          cacheSize: dataAgent.cache.size,
          processors: Array.from(dataAgent.dataProcessors.keys()),
          subscriptions: dataAgent.subscriptions.size
        }
      };
    }
    
    return response.data;
  },

  // Get system analytics and insights
  getAnalytics: async (timeRange = '7d') => {
    if (dataAgent) {
      try {
        return await dataAgent.generateAnalyticsReport(timeRange);
      } catch (error) {
        logger.warn('Data Agent analytics failed:', error);
      }
    }
    
    // Fallback analytics
    const [status, logs] = await Promise.all([
      systemAPI.getStatus(),
      systemAPI.getLogs()
    ]);
    
    return {
      timeRange,
      generatedAt: new Date(),
      summary: {
        systemStatus: status?.status || 'unknown',
        totalLogs: logs?.length || 0,
        errorLogs: logs?.filter(log => log.level === 'error').length || 0
      }
    };
  },

  // Real-time system monitoring
  subscribeToSystemUpdates: (callback) => {
    if (dataAgent) {
      try {
        dataAgent.setupRealTimeSubscription('system', {
          realTime: true,
          limit: 10
        });
        
        // Listen for real-time updates
        const handleUpdate = (event) => {
          if (event.detail.collection === 'system') {
            callback(event.detail.data);
          }
        };
        
        window.addEventListener('dataUpdate', handleUpdate);
        
        // Return cleanup function
        return () => {
          window.removeEventListener('dataUpdate', handleUpdate);
        };
      } catch (error) {
        logger.warn('Real-time subscription failed:', error);
      }
    }
    
    // Fallback to polling
    const interval = setInterval(async () => {
      try {
        const status = await systemAPI.getStatus();
        callback([status]);
      } catch (error) {
        logger.error('Polling error:', error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }
};

// Enhanced User API with Data Agent integration
export const userAPI = {
  // Get user profile with intelligent enrichment
  getProfile: async (userId) => {
    if (dataAgent) {
      try {
        const users = await dataAgent.fetchData('users', {
          filters: [{ field: 'uid', operator: '==', value: userId }],
          useCache: true,
          processor: true
        });
        return users[0] || null;
      } catch (error) {
        logger.warn('Data Agent failed, falling back to direct API:', error);
      }
    }
    
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile with cache invalidation
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}`, profileData);
    
    // Clear cache after update
    if (dataAgent) {
      dataAgent.clearCache();
    }
    
    return response.data;
  },

  // Get user analytics and insights
  getUserAnalytics: async (userId) => {
    if (dataAgent) {
      try {
        const user = await userAPI.getProfile(userId);
        if (user && user.usageStats) {
          return user.usageStats;
        }
      } catch (error) {
        logger.warn('Data Agent user analytics failed:', error);
      }
    }
    
    // Fallback analytics
    return {
      appsUsed: 0,
      lastLogin: new Date(),
      totalTime: 0
    };
  }
};

// Data Agent management functions
export const dataAgentAPI = {
  // Get data agent status
  getStatus: () => {
    if (!dataAgent) return { enabled: false };
    
    return {
      enabled: true,
      cacheSize: dataAgent.cache.size,
      subscriptions: dataAgent.subscriptions.size,
      processors: Array.from(dataAgent.dataProcessors.keys()),
      cacheTimeout: dataAgent.cacheTimeout
    };
  },

  // Clear data agent cache
  clearCache: () => {
    if (dataAgent) {
      dataAgent.clearCache();
      return { success: true, message: 'Cache cleared' };
    }
    return { success: false, message: 'Data Agent not initialized' };
  },

  // Get cache statistics
  getCacheStats: () => {
    if (!dataAgent) return null;
    
    const cacheEntries = Array.from(dataAgent.cache.entries());
    const stats = {
      totalEntries: cacheEntries.length,
      oldestEntry: null,
      newestEntry: null,
      totalSize: 0
    };
    
    if (cacheEntries.length > 0) {
      const timestamps = cacheEntries.map(([key, value]) => value.timestamp);
      stats.oldestEntry = new Date(Math.min(...timestamps));
      stats.newestEntry = new Date(Math.max(...timestamps));
      stats.totalSize = JSON.stringify(cacheEntries).length;
    }
    
    return stats;
  },

  // Destroy data agent
  destroy: () => {
    if (dataAgent) {
      dataAgent.destroy();
      dataAgent = null;
      return { success: true, message: 'Data Agent destroyed' };
    }
    return { success: false, message: 'Data Agent not initialized' };
  }
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.error || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    };
  }
};

export default api;
