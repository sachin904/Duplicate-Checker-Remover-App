import React, { useState } from 'react';
import { File, Trash2, AlertTriangle, Check, Clock, HardDrive } from 'lucide-react';
import { ScanResult, FileInfo } from '../types';

interface FilesListProps {
  scanResult: ScanResult;
  onDeleteFiles: (filePaths: string[]) => void;
  isLoading: boolean;
}

const FilesList: React.FC<FilesListProps> = ({ scanResult, onDeleteFiles, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  const handleFileSelect = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAllDuplicates = () => {
    const duplicateFiles = scanResult.files.filter(file => file.duplicate);
    const duplicatePaths = duplicateFiles.map(file => file.filePath);
    setSelectedFiles(new Set(duplicatePaths));
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.size > 0) {
      onDeleteFiles(Array.from(selectedFiles));
      setSelectedFiles(new Set());
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const filesToDisplay = showDuplicatesOnly 
    ? scanResult.files.filter(file => file.duplicate)
    : scanResult.files;

  const duplicateGroups = Object.values(scanResult.duplicateGroups || {});

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Scanned Files</h3>
            <p className="text-gray-600">
              Found {scanResult.totalFiles} files with {scanResult.duplicateCount} duplicates
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showDuplicatesOnly}
                onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show duplicates only</span>
            </label>
          </div>
        </div>

        {duplicateGroups.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleSelectAllDuplicates}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Select All Duplicates
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Clear Selection
            </button>
            {selectedFiles.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedFiles.size})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Groups */}
      {duplicateGroups.length > 0 && !showDuplicatesOnly && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h4 className="text-lg font-bold text-gray-900">Duplicate Groups</h4>
          </div>
          
          <div className="space-y-4">
            {duplicateGroups.map((group, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="font-medium text-red-800 mb-2">
                  Group {index + 1} - {group.length} duplicate files
                </p>
                <div className="space-y-2">
                  {group.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.filePath)}
                          onChange={() => handleFileSelect(file.filePath)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <File className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-mono text-gray-700">{file.fileName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.lastModified)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(new Set(filesToDisplay.map(f => f.filePath)));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filesToDisplay.map((file) => (
                <tr 
                  key={file.filePath}
                  className={`hover:bg-gray-50 ${file.duplicate ? 'bg-red-25' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.filePath)}
                      onChange={() => handleFileSelect(file.filePath)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{file.filePath}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {file.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <HardDrive className="w-4 h-4 text-gray-400 mr-2" />
                      {formatFileSize(file.size)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDate(file.lastModified)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {file.duplicate ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Duplicate
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Unique
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filesToDisplay.length === 0 && (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No files to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesList;