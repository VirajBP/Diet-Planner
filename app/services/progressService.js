import { mongodbService } from './mongodb.service';

class ProgressService {
  async getStatistics() {
    try {
      const response = await mongodbService.api.get('/progress/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching progress statistics:', error);
      throw error;
    }
  }

  async getDailyData() {
    try {
      const data = await this.getStatistics();
      return data.dailyData || [];
    } catch (error) {
      console.error('Error fetching daily data:', error);
      return [];
    }
  }

  async getWeeklyData() {
    try {
      const data = await this.getStatistics();
      return data.weeklyData || [];
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      return [];
    }
  }

  async getMonthlyData() {
    try {
      const data = await this.getStatistics();
      return data.monthlyData || [];
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      return [];
    }
  }

  async getStreaks() {
    try {
      const data = await this.getStatistics();
      return data.streaks || {};
    } catch (error) {
      console.error('Error fetching streaks:', error);
      return {};
    }
  }

  async getInsights() {
    try {
      const data = await this.getStatistics();
      return data.insights || [];
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }

  async getDetailedStatistics() {
    try {
      const data = await this.getStatistics();
      return data.statistics || {};
    } catch (error) {
      console.error('Error fetching detailed statistics:', error);
      return {};
    }
  }

  async getGoals() {
    try {
      const data = await this.getStatistics();
      return data.goals || {};
    } catch (error) {
      console.error('Error fetching goals:', error);
      return {};
    }
  }
}

const progressService = new ProgressService();
export default progressService; 