// File Service API for handling file restoration and duplicate management

export interface RecycleBinItem {
  id: string;
  name: string;
  originalPath: string;
  deletedDate: Date;
  size: number;
  recycleBinPath: string;
}

export interface DuplicateFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  isOriginal: boolean;
  hash: string;
  groupId: string;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  processedFiles: number;
  failedFiles: number;
  errors?: string[];
}

class FileService {
  private baseUrl: string;

  constructor() {
    // This should point to your backend API
    this.baseUrl = 'http://localhost:8080/api';
  }

  /**
   * Scan the system recycle bin for deleted files
   */
  async scanRecycleBin(): Promise<RecycleBinItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/recycle-bin/scan`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert string dates to Date objects
      return data.map((item: any) => ({
        ...item,
        deletedDate: new Date(item.deletedDate),
      }));
    } catch (error) {
      console.error('Error scanning recycle bin:', error);
      throw new Error('Failed to scan recycle bin');
    }
  }

  /**
   * Restore files from recycle bin
   */
  async restoreFiles(itemIds: string[]): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/files/recycle-bin/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error restoring files:', error);
      throw new Error('Failed to restore files');
    }
  }

  /**
   * Scan directory for duplicate files
   */
  async scanForDuplicates(directory?: string): Promise<DuplicateFile[]> {
    try {
      const url = new URL(`${this.baseUrl}/files/duplicates/scan`);
      if (directory) {
        url.searchParams.append('directory', directory);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert string dates to Date objects
      return data.map((file: any) => ({
        ...file,
        lastModified: new Date(file.lastModified),
      }));
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      throw new Error('Failed to scan for duplicates');
    }
  }

  /**
   * Remove duplicate files
   */
  async removeDuplicates(fileIds: string[]): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/files/duplicates/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing duplicates:', error);
      throw new Error('Failed to remove duplicate files');
    }
  }

  /**
   * Mark files as original (keep) in duplicate groups
   */
  async markAsOriginal(fileIds: string[]): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/files/duplicates/mark-original`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking files as original:', error);
      throw new Error('Failed to mark files as original');
    }
  }

  /**
   * Get system file information
   */
  async getSystemInfo(): Promise<{
    recycleBinCount: number;
    duplicateCount: number;
    totalSize: number;
    lastScan: Date | null;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/files/system-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        ...data,
        lastScan: data.lastScan ? new Date(data.lastScan) : null,
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      throw new Error('Failed to get system information');
    }
  }

  /**
   * Perform a deep scan of the system
   */
  async performDeepScan(options: {
    scanRecycleBin: boolean;
    scanDuplicates: boolean;
    directories: string[];
  }): Promise<{
    recycleBinItems: RecycleBinItem[];
    duplicateFiles: DuplicateFile[];
    scanDuration: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/files/deep-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        recycleBinItems: data.recycleBinItems?.map((item: any) => ({
          ...item,
          deletedDate: new Date(item.deletedDate),
        })) || [],
        duplicateFiles: data.duplicateFiles?.map((file: any) => ({
          ...file,
          lastModified: new Date(file.lastModified),
        })) || [],
        scanDuration: data.scanDuration,
      };
    } catch (error) {
      console.error('Error performing deep scan:', error);
      throw new Error('Failed to perform deep scan');
    }
  }

  /**
   * Export scan results to file
   */
  async exportResults(format: 'json' | 'csv' | 'xml', data: {
    recycleBinItems?: RecycleBinItem[];
    duplicateFiles?: DuplicateFile[];
  }): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/files/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting results:', error);
      throw new Error('Failed to export results');
    }
  }

  /**
   * Check if the backend service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Service health check failed:', error);
      return false;
    }
  }

  /**
   * WebSocket connection for real-time updates during operations
   */
  createWebSocketConnection(onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    return ws;
  }
}

// Create and export a singleton instance
export const fileService = new FileService();
export default fileService;
