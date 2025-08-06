import React from 'react';
import { FolderOpen, File, Package, Image, FileText, Video, Music, Archive, Wrench } from 'lucide-react';
import { ScanResult, FileInfo } from '../types';

interface CategoryViewProps {
  scanResult: ScanResult;
}

const CategoryView: React.FC<CategoryViewProps> = ({ scanResult }) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'applications':
        return <Package className="w-5 h-5" />;
      case 'documents':
        return <FileText className="w-5 h-5" />;
      case 'images':
        return <Image className="w-5 h-5" />;
      case 'videos':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      case 'archives':
        return <Archive className="w-5 h-5" />;
      case 'installers':
        return <Wrench className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      applications: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      documents: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      images: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      videos: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      audio: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      archives: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      installers: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      temporary: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
      others: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    };

    return colors[category.toLowerCase()] || colors.others;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const categorizedFiles = scanResult.categorizedFiles || {};
  const categories = Object.keys(categorizedFiles);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Categorized Files</h3>
        </div>
        <p className="text-gray-600">
          Files organized by category with {categories.length} different categories found
        </p>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          const files = categorizedFiles[category];
          const duplicateCount = files.filter(file => file.duplicate).length;
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          const colors = getCategoryColor(category);

          return (
            <div key={category} className={`${colors.bg} ${colors.border} border rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-white ${colors.text}`}>
                  {getCategoryIcon(category)}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${colors.text}`}>{files.length}</p>
                  <p className={`text-xs ${colors.text} opacity-75`}>files</p>
                </div>
              </div>
              <h4 className={`font-semibold ${colors.text} capitalize mb-2`}>{category}</h4>
              <div className="space-y-1 text-xs">
                <p className={colors.text}>
                  Total size: {formatFileSize(totalSize)}
                </p>
                {duplicateCount > 0 && (
                  <p className="text-red-600 font-medium">
                    {duplicateCount} duplicates found
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Category Views */}
      <div className="space-y-6">
        {categories.map((category) => {
          const files = categorizedFiles[category];
          const colors = getCategoryColor(category);

          return (
            <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`${colors.bg} ${colors.border} border-b px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-white ${colors.text}`}>
                      {getCategoryIcon(category)}
                    </div>
                    <div>
                      <h4 className={`font-bold ${colors.text} capitalize text-lg`}>{category}</h4>
                      <p className={`${colors.text} opacity-75 text-sm`}>
                        {files.length} files • {files.filter(f => f.duplicate).length} duplicates
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Extension
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 ${file.duplicate ? 'bg-red-25' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <File className="w-4 h-4 text-gray-400 mr-3" />
                            <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                            {file.extension || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {file.duplicate ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Unique
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {file.filePath}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryView;