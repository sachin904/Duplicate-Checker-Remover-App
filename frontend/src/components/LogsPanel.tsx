import React, { useState } from 'react';
import { Activity, Clock, FileText, Trash2, Search, Filter } from 'lucide-react';
import { ScanResult } from '../types';

interface LogsPanelProps {
  scans: ScanResult[];
}

const LogsPanel: React.FC<LogsPanelProps> = ({ scans }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (scanTime: string): string => {
    // Mock duration calculation - in real app this would be tracked
    return '2.5s';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesStatus = filterStatus === 'all' || scan.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      scan.directory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scanId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Generate mock activity logs
  const generateActivityLogs = (scan: ScanResult) => [
    {
      time: scan.scanTime,
      action: 'Scan started',
      details: `Scanning directory: ${scan.directory}`,
      type: 'info'
    },
    {
      time: new Date(new Date(scan.scanTime).getTime() + 1000).toISOString(),
      action: 'Files discovered',
      details: `Found ${scan.totalFiles} files`,
      type: 'info'
    },
    {
      time: new Date(new Date(scan.scanTime).getTime() + 2000).toISOString(),
      action: 'Duplicates detected',
      details: `Identified ${scan.duplicateCount} duplicate files`,
      type: scan.duplicateCount > 0 ? 'warning' : 'info'
    },
    {
      time: new Date(new Date(scan.scanTime).getTime() + 2500).toISOString(),
      action: 'Scan completed',
      details: 'Categorization and duplicate detection finished',
      type: 'success'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Activity Logs</h3>
            <p className="text-gray-600">View scan history and detailed operation logs</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by directory or scan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-2xl font-bold text-blue-600">{scans.length}</p>
            </div>
            <Search className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Files Processed</p>
              <p className="text-2xl font-bold text-green-600">
                {scans.reduce((sum, scan) => sum + scan.totalFiles, 0).toLocaleString()}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duplicates Found</p>
              <p className="text-2xl font-bold text-red-600">
                {scans.reduce((sum, scan) => sum + scan.duplicateCount, 0).toLocaleString()}
              </p>
            </div>
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Scan History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Scan History</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredScans.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scan logs found</p>
            </div>
          ) : (
            filteredScans.map((scan) => (
              <div key={scan.scanId} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-900">
                      Scan #{scan.scanId.slice(-8)}
                    </h5>
                    <p className="text-sm text-gray-600">{scan.directory}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                      {scan.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(scan.scanTime)}</p>
                  </div>
                </div>

                {/* Scan Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Files Scanned</p>
                    <p className="text-lg font-bold text-blue-800">{scan.totalFiles}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium">Duplicates</p>
                    <p className="text-lg font-bold text-red-800">{scan.duplicateCount}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Categories</p>
                    <p className="text-lg font-bold text-green-800">
                      {Object.keys(scan.categorizedFiles || {}).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium">Duration</p>
                    <p className="text-lg font-bold text-purple-800">{formatDuration(scan.scanTime)}</p>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-900">Activity Timeline</h6>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {generateActivityLogs(scan).map((log, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 mt-0.5">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(log.time)}
                            </div>
                          </div>
                          <p className="text-gray-600">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsPanel;