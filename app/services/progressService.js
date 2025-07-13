import { mongodbService } from './mongodb.service';

class ProgressService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.pendingRequests = new Map(); // Prevent duplicate requests
  }

  async getStatistics() {
    try {
      const response = await mongodbService.api.get('/progress/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching progress statistics:', error);
      throw error;
    }
  }

  async refreshData() {
    try {
      // Clear cache to force fresh data fetch
      this.cache.clear();
      this.pendingRequests.clear();
      // Fetch fresh statistics
      await this.getStatistics();
      console.log('Progress statistics refreshed successfully');
    } catch (error) {
      console.error('Error refreshing progress data:', error);
      throw error;
    }
  }

  async getDailyData() {
    const cacheKey = 'dailyData';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.dailyData || [];
    });
  }

  async getWeeklyData() {
    const cacheKey = 'weeklyData';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.weeklyData || [];
    });
  }

  async getMonthlyData() {
    const cacheKey = 'monthlyData';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.monthlyData || [];
    });
  }

  async getStreaks() {
    const cacheKey = 'streaks';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.streaks || {};
    });
  }

  async getInsights() {
    const cacheKey = 'insights';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.insights || [];
    });
  }

  async getDetailedStatistics() {
    const cacheKey = 'detailedStatistics';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.statistics || {};
    });
  }

  async getGoals() {
    const cacheKey = 'goals';
    return this.getCachedData(cacheKey, async () => {
      const data = await this.getStatistics();
      return data.goals || {};
    });
  }

  // Helper method to handle caching and prevent duplicate requests
  async getCachedData(cacheKey, fetchFunction) {
    // Check if we have a pending request for this key
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Create a new promise for this request
    const promise = fetchFunction().then(data => {
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Store the promise to prevent duplicate requests
    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }
}

const progressService = new ProgressService();
export default progressService; 