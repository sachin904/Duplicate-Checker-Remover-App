import React, { useState } from 'react';
import { Search, FolderOpen } from 'lucide-react';

interface ScanFormProps {
  onScan: (directory: string) => void;
  isLoading: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({ onScan, isLoading }) => {
  const [directory, setDirectory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (directory.trim()) {
      onScan(directory.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Search className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Start Directory Scan</h2>
          <p className="text-gray-600">Enter the directory path to scan for duplicate applications</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="directory" className="block text-sm font-medium text-gray-700 mb-2">
            Directory Path
          </label>
          <div className="relative">
            <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="directory"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              placeholder="/path/to/directory or C:\Program Files"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Enter the full path to the directory you want to scan for duplicate applications
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !directory.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Start Scan</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for better results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use absolute paths for better accuracy</li>
          <li>• Scanning may take time for large directories</li>
          <li>• The tool will generate SHA-256 hashes to detect true duplicates</li>
        </ul>
      </div>
    </div>
  );
};

export default ScanForm;