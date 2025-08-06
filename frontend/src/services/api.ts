import axios from 'axios';
import { ScanResult, ScanResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start the backend server.');
    }
    if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Please check your connection.');
    }
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check the backend server.');
    }
    if (error.response?.status >= 500) {
      throw new Error('Backend server error. Please try again later.');
    }
    throw error;
  }
);

export interface ScanProgress {
  scanId: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  duplicateCount: number;
  progressPercentage: number;
  startTime: string;
  lastUpdate: string;
  currentDirectory: string;
  errors: string[];
}

export interface DuplicateStream {
  scanId: string;
  duplicates: any[];
  count: number;
  timestamp: number;
}

export const scanService = {
  async startScan(directory: string): Promise<ScanResponse> {
    try {
      const response = await api.post('/scan', { directory });
      return response.data;
    } catch (error) {
      console.error('Start scan error:', error);
      throw error;
    }
  },

  async getScanResult(scanId: string): Promise<ScanResult> {
    try {
      const response = await api.get(`/scan/${scanId}`);
      return response.data;
    } catch (error) {
      console.error('Get scan result error:', error);
      throw error;
    }
  },

  async getScanProgress(scanId: string): Promise<ScanProgress> {
    try {
      const response = await api.get(`/scan/${scanId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Get scan progress error:', error);
      throw error;
    }
  },

  async getDuplicateStream(scanId: string): Promise<DuplicateStream> {
    try {
      const response = await api.get(`/scan/${scanId}/duplicates/stream`);
      return response.data;
    } catch (error) {
      console.error('Get duplicate stream error:', error);
      throw error;
    }
  },

  async getAllScans(): Promise<ScanResult[]> {
    try {
      const response = await api.get('/scans');
      return response.data;
    } catch (error) {
      console.error('Get all scans error:', error);
      throw error;
    }
  },

  async deleteDuplicates(scanId: string, filePaths: string[]): Promise<boolean> {
    try {
      console.log('Sending permanent deletion request for files:', filePaths);
      const response = await api.delete(`/duplicates/${scanId}`, {
        data: { filePaths }
      });
      console.log('Permanent deletion response:', response.data);
      
      // Return true if the operation was successful (even partial success)
      if (response.data.success !== undefined) {
        return response.data.success;
      }
      
      // Fallback: check if response status is OK
      return response.status >= 200 && response.status < 300;
    } catch (error: any) {
      console.error('Error permanently deleting files:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to permanently delete files');
    }
  },

  async deleteDirectories(scanId: string, directoryPaths: string[]): Promise<boolean> {
    try {
      const response = await api.delete(`/directories/${scanId}`, {
        data: { directoryPaths }
      });
      console.log('Directories permanently deleted:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error permanently deleting directories:', error);
      throw new Error('Failed to permanently delete directories');
    }
  },

  async checkHealth(): Promise<string> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  async testFileOperation(): Promise<any> {
    try {
      const response = await api.get('/test-file-operation');
      return response.data;
    } catch (error) {
      console.error('File operation test error:', error);
      throw error;
    }
  }
};

