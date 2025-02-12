// module.exports = ;

const axios = require('axios');
const pdfParse = require('pdf-parse'); 
const path = require('path');
const fs = require('fs');
const config = require('config');

const flaskHost = config.get('flask.host');
const flaskPort = config.get('flask.port');

//FLASK API BACKEND SHOULD BE RUNNNING
const API_URL = `http://${flaskHost}:${flaskPort}/predict`;


// Function to extract text from PDF
async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);  // Read the PDF file
    const pdfData = await pdfParse(dataBuffer);   // Extract text using pdf-parse
    return pdfData.text;  // Return the extracted text
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return null;
  }
}

async function getPredictionFromAPI(text) {
  try {
    const response = await axios.post(API_URL, { text });
    console.log('Prediction Response:', response.data);  // Log the returned prediction data
  } catch (error) {
    console.error('Error calling API:', error);
  }
}


// Function to handle file upload and prediction
async function handleFileUpload(filePath) {
  const extractedText = await extractTextFromPDF(filePath);  // Extract text from the uploaded PDF
  if (extractedText) {
    console.log('Extracted Text:', extractedText);  // Log the extracted text
    await getPredictionFromAPI(extractedText);       // Send the extracted text to the API
  } else {
    console.log('No text extracted from the PDF.');
  }
}

module.exports = { handleFileUpload };






























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

  //set includeChildren to false para mas onti
  async getGoals(includeChildren = false) {
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