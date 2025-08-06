import axios from 'axios';
import { ScanResult, ScanResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanService = {
  async startScan(directory: string): Promise<ScanResponse> {
    const response = await api.post('/scan', { directory });
    return response.data;
  },

  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await api.get(`/scan/${scanId}`);
    return response.data;
  },

  async getAllScans(): Promise<ScanResult[]> {
    const response = await api.get('/scans');
    return response.data;
  },

  async deleteDuplicates(scanId: string, filePaths: string[]): Promise<{ success: boolean; deletedCount: number }> {
    const response = await api.delete(`/duplicates/${scanId}`, {
      data: { filePaths }
    });
    return response.data;
  },

  async checkHealth(): Promise<string> {
    const response = await api.get('/health');
    return response.data;
  }
};