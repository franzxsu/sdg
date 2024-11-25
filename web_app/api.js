// module.exports = ;

const axios = require('axios');

class UNSDGApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://unstats.un.org/sdgapi/api/v1/sdg',
      timeout: 10000, // 10s
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    this.initInterceptors();
  }
  initInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  handleError(error) {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status Code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }

  async getGoals(includeChildren = true) {
    try {
      const response = await this.axiosInstance.get('/Goal/List', {
        params: {
          includechildren: includeChildren
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getGoalByCode(code, includeChildren = true) {
    try {
      const response = await this.axiosInstance.get(`/Goal/${code}`, {
        params: {
          includechildren: includeChildren
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getTargetsForGoal(goalCode, includeChildren = true) {
    try {
      const response = await this.axiosInstance.get(`/Goal/${goalCode}/Target`, {
        params: {
          includechildren: includeChildren
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getIndicatorsForTarget(goalCode, targetCode, includeChildren = true) {
    try {
      const response = await this.axiosInstance.get(`/Goal/${goalCode}/Target/${targetCode}/Indicator`, {
        params: {
          includechildren: includeChildren
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  transformGoalData(goals) {
    return goals.map(goal => ({
      code: goal.code,
      title: goal.title,
      description: goal.description,
      targetCount: goal.targets ? goal.targets.length : 0
    }));
  }
}

module.exports = new UNSDGApiService();