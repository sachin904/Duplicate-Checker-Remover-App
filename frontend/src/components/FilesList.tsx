import React, { useState, useEffect, useMemo } from 'react';
import { File, Trash2, AlertTriangle, Check, Clock, HardDrive, Folder, FolderOpen } from 'lucide-react';
import { ScanResult, FileInfo } from '../types';

interface FilesListProps {
  scanResult: ScanResult;
  onDeleteFiles: (filePaths: string[]) => void;
  isLoading: boolean;
}

const FilesList: React.FC<FilesListProps> = ({ scanResult, onDeleteFiles, isLoading }) => {
  // Create an updated list of files with corrected duplicate status
  // If only one file remains for a given hash, it should be marked as unique (duplicate = false)
  const updatedFiles = useMemo(() => {
    if (!scanResult || !scanResult.files) return [];
    
    console.log('Scan result updated:', {
      totalFiles: scanResult.files.length,
      duplicateCount: scanResult.duplicateCount,
      filesWithDuplicates: scanResult.files.filter(f => f.duplicate).length
    });
    
    // Group files by hash
    const filesByHash = scanResult.files.reduce<Record<string, FileInfo[]>>((acc, file) => {
      if (!acc[file.hash]) acc[file.hash] = [];
      acc[file.hash].push(file);
      return acc;
    }, {});

    // Update duplicate status: if only one file remains with a given hash, mark it as unique
    const result = scanResult.files.map(file => {
      const filesWithSameHash = filesByHash[file.hash] || [];
      const originalStatus = file.duplicate;
      
      let newStatus;
      if (filesWithSameHash.length <= 1) {
        // Only one file with this hash, so it's unique now
        newStatus = false;
      } else if (filesWithSameHash.length > 1) {
        // Multiple files with same hash, so they are duplicates
        newStatus = true;
      } else {
        // Fallback to original status
        newStatus = originalStatus;
      }
      
      // Log status changes and track recently updated files
      if (originalStatus !== newStatus) {
        console.log(`File ${file.fileName} status changed from ${originalStatus ? 'duplicate' : 'unique'} to ${newStatus ? 'duplicate' : 'unique'}`);
        // Track files that just became unique
        if (!newStatus && originalStatus) {
          setRecentlyUpdatedFiles(prev => new Set([...prev, file.filePath]));
          // Clear the highlight after 3 seconds
          setTimeout(() => {
            setRecentlyUpdatedFiles(prev => {
              const newSet = new Set(prev);
              newSet.delete(file.filePath);
              return newSet;
            });
          }, 3000);
        }
      }
      
      return { ...file, duplicate: newStatus };
    });
    
    console.log('Updated files:', {
      totalFiles: result.length,
      uniqueFiles: result.filter(f => !f.duplicate).length,
      duplicateFiles: result.filter(f => f.duplicate).length
    });
    
    return result;
  }, [scanResult]);

  // Create updated duplicate groups based on the corrected files
  const updatedDuplicateGroups = useMemo(() => {
    if (!scanResult || !scanResult.duplicateGroups) return [];
    
    // Group files by hash using the updated files
    const filesByHash = updatedFiles.reduce<Record<string, FileInfo[]>>((acc, file) => {
      if (!acc[file.hash]) acc[file.hash] = [];
      acc[file.hash].push(file);
      return acc;
    }, {});

    // Only return groups that still have duplicates (more than 1 file)
    // and ensure files within each group have the correct duplicate status
    return Object.values(filesByHash)
      .filter(group => group.length > 1)
      .map(group => {
        // All files in a group with more than 1 file are duplicates
        // But we should use the updated duplicate status from updatedFiles
        return group.map(file => {
          const updatedFile = updatedFiles.find(f => f.filePath === file.filePath);
          return updatedFile || file;
        });
      });
  }, [updatedFiles, scanResult]);

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedDirectories, setSelectedDirectories] = useState<Set<string>>(new Set());
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'duplicates' | 'directories'>('files');
  const [recentlyUpdatedFiles, setRecentlyUpdatedFiles] = useState<Set<string>>(new Set());

  const handleFileSelect = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleDirectorySelect = (directoryPath: string) => {
    const newSelected = new Set(selectedDirectories);
    if (newSelected.has(directoryPath)) {
      newSelected.delete(directoryPath);
    } else {
      newSelected.add(directoryPath);
    }
    setSelectedDirectories(newSelected);
  };

  // Select all duplicates (including originals)
  const handleSelectAllDuplicates = () => {
    const duplicateFiles = updatedFiles.filter(file => file.duplicate);
    const duplicatePaths = duplicateFiles.map(file => file.filePath);
    setSelectedFiles(new Set(duplicatePaths));
  };

  const handleDeleteSelected = () => {
    const allSelectedPaths = [...selectedFiles, ...selectedDirectories];
    if (allSelectedPaths.length > 0) {
      onDeleteFiles(allSelectedPaths);
      setSelectedFiles(new Set());
      setSelectedDirectories(new Set());
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

  const getDirectoryFromPath = (filePath: string): string => {
    const pathParts = filePath.split(/[\\/]/);
    return pathParts.slice(0, -1).join('/');
  };

  const filesToDisplay = showDuplicatesOnly 
    ? updatedFiles.filter(file => file.duplicate)
    : updatedFiles;

  // Calculate updated duplicate count from the corrected files
  const currentDuplicateCount = updatedFiles.filter(file => file.duplicate).length;
  
  const directoryDuplicates = Object.values(scanResult.directoryDuplicates || {});

  return (
    <div className="space-y-6">
      {/* Summary and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Scanned Files</h3>
            <p className="text-gray-600">
              Found {updatedFiles.length} files with {currentDuplicateCount} duplicates
              {updatedFiles.filter(f => f.markedForDeletion).length > 0 && ` (${updatedFiles.filter(f => f.markedForDeletion).length} mark for deletion)`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showDuplicatesOnly}
                onChange={(e) => {
                  setShowDuplicatesOnly(e.target.checked);
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show duplicates only</span>
            </label>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">

          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'duplicates'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Duplicates ({currentDuplicateCount})
          </button>
            <button
                onClick={handleSelectAllDuplicates}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
                Select All Duplicates ({currentDuplicateCount})
            </button>
            <button
                onClick={() => {
                    setSelectedFiles(new Set());
                    setSelectedDirectories(new Set());
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
                Clear Selection
            </button>
          {directoryDuplicates.length > 0 && (
            <button
              onClick={() => setActiveTab('directories')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'directories'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Duplicate Directories ({directoryDuplicates.length})
            </button>

          )}
        </div>

        {/* Action Buttons */}
        {updatedDuplicateGroups.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">


            {(selectedFiles.size > 0 || selectedDirectories.size > 0) && (
              <button
                onClick={() => {
                  console.log('Delete button clicked');
                  console.log('Selected files:', Array.from(selectedFiles));
                  console.log('Selected directories:', Array.from(selectedDirectories));
                  console.log('Total selected items:', selectedFiles.size + selectedDirectories.size);
                  handleDeleteSelected();
                }}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isLoading 
                    ? `Deleting ${selectedFiles.size + selectedDirectories.size} items...` 
                    : `Delete (${selectedFiles.size + selectedDirectories.size})`
                  }
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content based on active tab */}
             {activeTab === 'files' && (
         <FilesTable 
           files={filesToDisplay}
           selectedFiles={selectedFiles}
           onFileSelect={handleFileSelect}
           formatFileSize={formatFileSize}
           formatDate={formatDate}
           recentlyUpdatedFiles={recentlyUpdatedFiles}
         />
       )}

             {activeTab === 'duplicates' && (
         <DuplicatesView 
           duplicateGroups={updatedDuplicateGroups}
           selectedFiles={selectedFiles}
           onFileSelect={handleFileSelect}
           formatFileSize={formatFileSize}
           formatDate={formatDate}
           recentlyUpdatedFiles={recentlyUpdatedFiles}
         />
       )}

      {activeTab === 'directories' && (
        <DirectoriesView 
          directoryDuplicates={directoryDuplicates}
          selectedDirectories={selectedDirectories}
          onDirectorySelect={handleDirectorySelect}
          formatFileSize={formatFileSize}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Files Table Component
const FilesTable: React.FC<{
  files: FileInfo[];
  selectedFiles: Set<string>;
  onFileSelect: (filePath: string) => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  recentlyUpdatedFiles: Set<string>;
}> = ({ files, selectedFiles, onFileSelect, formatFileSize, formatDate, recentlyUpdatedFiles }) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPaths = files.map(f => f.filePath);
      allPaths.forEach(path => onFileSelect(path));
    } else {
      // Clear all selections
      selectedFiles.forEach(path => onFileSelect(path));
    }
  };

  const allSelected = files.length > 0 && files.every(file => selectedFiles.has(file.filePath));
  const someSelected = files.some(file => selectedFiles.has(file.filePath));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            {files.map((file) => (
                             <tr 
                 key={file.filePath}
                 className={`hover:bg-gray-50 ${
                   file.duplicate 
                     ? file.markedForDeletion 
                       ? 'bg-red-100' 
                       : 'bg-yellow-50'
                     : recentlyUpdatedFiles.has(file.filePath)
                     ? 'bg-green-100 border-l-4 border-green-500'
                     : ''
                 }`}
               >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.filePath)}
                    onChange={() => onFileSelect(file.filePath)}
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
                  {file.markedForDeletion ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Duplicate
                    </span>
                  ) : file.duplicate ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                        Duplicate
                    </span>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recentlyUpdatedFiles.has(file.filePath) 
                        ? 'bg-green-200 text-green-900 animate-pulse' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <Check className="w-3 h-3 mr-1" />
                      {recentlyUpdatedFiles.has(file.filePath) ? 'Unique (Updated)' : 'Unique'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No files to display</p>
        </div>
      )}
    </div>
  );
};

// Duplicates View Component
const DuplicatesView: React.FC<{
  duplicateGroups: FileInfo[][];
  selectedFiles: Set<string>;
  onFileSelect: (filePath: string) => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  recentlyUpdatedFiles: Set<string>;
}> = ({ duplicateGroups, selectedFiles, onFileSelect, formatFileSize, formatDate, recentlyUpdatedFiles }) => (
  <div className="space-y-4">
    {duplicateGroups.map((group, index) => (
      <div key={index} className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h4 className="text-lg font-bold text-gray-900">
              Duplicate Group {index + 1} - {group.length} files
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {group.filter(f => f.markedForDeletion).length} marked for deletion
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {group.map((file, fileIndex) => (
            <div 
              key={fileIndex} 
              className={`flex items-center justify-between py-3 px-4 rounded-lg border ${
                file.markedForDeletion 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.filePath)}
                  onChange={() => onFileSelect(file.filePath)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <File className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                  <div className="text-xs text-gray-500">{file.filePath}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.lastModified)}</span>
                {file.markedForDeletion ? (
                  <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    Marked for Deletion
                  </span>
                ) : file.duplicate ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Duplicate
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    recentlyUpdatedFiles.has(file.filePath) 
                      ? 'bg-green-200 text-green-900 animate-pulse' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <Check className="w-3 h-3 mr-1" />
                    {recentlyUpdatedFiles.has(file.filePath) ? 'Unique (Updated)' : 'Unique'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Directories View Component
const DirectoriesView: React.FC<{
  directoryDuplicates: FileInfo[][];
  selectedDirectories: Set<string>;
  onDirectorySelect: (directoryPath: string) => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}> = ({ directoryDuplicates, selectedDirectories, onDirectorySelect, formatFileSize, formatDate }) => (
  <div className="space-y-4">
    {directoryDuplicates.map((group, index) => {
      const directories = group.reduce((acc, file) => {
        const dir = file.filePath.split(/[\\/]/).slice(0, -1).join('/');
        if (!acc.includes(dir)) acc.push(dir);
        return acc;
      }, [] as string[]);

      return (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Folder className="w-6 h-6 text-orange-500" />
              <h4 className="text-lg font-bold text-gray-900">
                Duplicate Directory Group {index + 1} - {directories.length} directories
              </h4>
            </div>
          </div>
          
          <div className="space-y-3">
            {directories.map((directory, dirIndex) => (
              <div key={dirIndex} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDirectories.has(directory)}
                      onChange={() => onDirectorySelect(directory)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <FolderOpen className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{directory}</span>
                      <div className="text-xs text-gray-500">
                        {group.filter(f => f.filePath.startsWith(directory)).length} files
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(group.filter(f => f.filePath.startsWith(directory))
                      .reduce((sum, f) => sum + f.size, 0))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default FilesList;