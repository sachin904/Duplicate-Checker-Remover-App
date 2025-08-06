export interface FileInfo {
  filePath: string;
  fileName: string;
  hash: string;
  size: number;
  extension: string;
  category: string;
  lastModified: string;
  duplicate: boolean;
}

export interface ScanResult {
  scanId: string;
  directory: string;
  scanTime: string;
  files: FileInfo[];
  duplicateGroups: Record<string, FileInfo[]>;
  categorizedFiles: Record<string, FileInfo[]>;
  totalFiles: number;
  duplicateCount: number;
  status: string;
}

export interface ScanResponse {
  scanId: string;
  status: string;
}