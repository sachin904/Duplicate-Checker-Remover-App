import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, Settings, Activity, FolderOpen, AlertCircle, CheckCircle, Clock, Files } from 'lucide-react';
import ScanForm from './components/ScanForm';
import FilesList from './components/FilesList';
import CategoryView from './components/CategoryView';
import SettingsPanel from './components/SettingsPanel';
import LogsPanel from './components/LogsPanel';
import { scanService } from './services/api';
import { ScanResult } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [allScans, setAllScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAllScans();
  }, []);

  const loadAllScans = async () => {
    try {
      const scans = await scanService.getAllScans();
      setAllScans(scans);
    } catch (err) {
      console.error('Failed to load scans:', err);
    }
  };

  const handleScanStart = async (directory: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await scanService.startScan(directory);
      const scanResult = await scanService.getScanResult(response.scanId);
      setCurrentScan(scanResult);
      await loadAllScans();
      setActiveTab('files');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFiles = async (filePaths: string[]) => {
    if (!currentScan) return;

    setIsLoading(true);
    try {
      await scanService.deleteDuplicates(currentScan.scanId, filePaths);
      // Refresh scan results
      const updatedScan = await scanService.getScanResult(currentScan.scanId);
      setCurrentScan(updatedScan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <div className="space-y-6">
            <ScanForm onScan={handleScanStart} isLoading={isLoading} />
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {currentScan && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Scan Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Files</p>
                        <p className="text-2xl font-bold text-blue-800">{currentScan.totalFiles}</p>
                      </div>
                      <Files className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Duplicates</p>
                        <p className="text-2xl font-bold text-red-800">{currentScan.duplicateCount}</p>
                      </div>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Categories</p>
                        <p className="text-2xl font-bold text-green-800">
                          {Object.keys(currentScan.categorizedFiles || {}).length}
                        </p>
                      </div>
                      <FolderOpen className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Scan Time</p>
                        <p className="text-sm font-medium text-purple-800">
                          {new Date(currentScan.scanTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'files':
        return currentScan ? (
          <FilesList 
            scanResult={currentScan} 
            onDeleteFiles={handleDeleteFiles}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No scan results available. Please start a scan first.</p>
          </div>
        );
      case 'categories':
        return currentScan ? (
          <CategoryView scanResult={currentScan} />
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categorized files available. Please start a scan first.</p>
          </div>
        );
      case 'settings':
        return <SettingsPanel />;
      case 'logs':
        return <LogsPanel scans={allScans} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'scan', label: 'Scan', icon: Search },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Duplicate App Remover</h1>
                <p className="text-sm text-gray-600">Find and remove duplicate applications efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;