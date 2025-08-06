import React, { useState } from 'react';
import { Settings, FolderOpen, Save, Plus, Trash2, Edit } from 'lucide-react';

interface CategoryRule {
  id: string;
  name: string;
  pattern: string;
  category: string;
  type: 'extension' | 'filename' | 'path';
}

const SettingsPanel: React.FC = () => {
  const [defaultScanPath, setDefaultScanPath] = useState('');
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([
    { id: '1', name: 'Executable Files', pattern: 'exe,msi,app', category: 'Applications', type: 'extension' },
    { id: '2', name: 'Setup Files', pattern: '*setup*,*install*', category: 'Installers', type: 'filename' },
    { id: '3', name: 'Document Files', pattern: 'pdf,doc,docx,txt', category: 'Documents', type: 'extension' },
  ]);
  
  const [newRule, setNewRule] = useState<Omit<CategoryRule, 'id'>>({
    name: '',
    pattern: '',
    category: '',
    type: 'extension'
  });
  
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const handleSaveSettings = () => {
    // Here you would typically save to localStorage or send to backend
    console.log('Saving settings:', { defaultScanPath, categoryRules });
    alert('Settings saved successfully!');
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.pattern && newRule.category) {
      setCategoryRules([...categoryRules, { ...newRule, id: Date.now().toString() }]);
      setNewRule({ name: '', pattern: '', category: '', type: 'extension' });
    }
  };

  const handleDeleteRule = (id: string) => {
    setCategoryRules(categoryRules.filter(rule => rule.id !== id));
  };

  const handleEditRule = (id: string) => {
    setEditingRule(editingRule === id ? null : id);
  };

  const handleUpdateRule = (id: string, updatedRule: Partial<CategoryRule>) => {
    setCategoryRules(categoryRules.map(rule => 
      rule.id === id ? { ...rule, ...updatedRule } : rule
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Settings</h3>
            <p className="text-gray-600">Configure scan paths and categorization rules</p>
          </div>
        </div>
      </div>

      {/* Default Scan Path */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
          Default Scan Path
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Directory Path
            </label>
            <input
              type="text"
              value={defaultScanPath}
              onChange={(e) => setDefaultScanPath(e.target.value)}
              placeholder="/path/to/default/directory"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              This path will be pre-filled when starting a new scan
            </p>
          </div>
        </div>
      </div>

      {/* Category Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Categorization Rules
        </h4>
        
        {/* Add New Rule Form */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Rule</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Rule name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Pattern (e.g., exe,msi or *setup*)"
              value={newRule.pattern}
              onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Category name"
              value={newRule.category}
              onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-2">
              <select
                value={newRule.type}
                onChange={(e) => setNewRule({ ...newRule, type: e.target.value as 'extension' | 'filename' | 'path' })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="extension">Extension</option>
                <option value="filename">Filename</option>
                <option value="path">Path</option>
              </select>
              <button
                onClick={handleAddRule}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Existing Rules */}
        <div className="space-y-3">
          {categoryRules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              {editingRule === rule.id ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={rule.name}
                    onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={rule.pattern}
                    onChange={(e) => handleUpdateRule(rule.id, { pattern: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={rule.category}
                    onChange={(e) => handleUpdateRule(rule.id, { category: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={rule.type}
                      onChange={(e) => handleUpdateRule(rule.id, { type: e.target.value as 'extension' | 'filename' | 'path' })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="extension">Extension</option>
                      <option value="filename">Filename</option>
                      <option value="path">Path</option>
                    </select>
                    <button
                      onClick={() => setEditingRule(null)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-medium text-gray-900">{rule.name}</h6>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Pattern: <code className="bg-gray-100 px-1 rounded">{rule.pattern}</code></span>
                      <span>Category: <span className="font-medium">{rule.category}</span></span>
                      <span>Type: <span className="capitalize">{rule.type}</span></span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRule(rule.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;