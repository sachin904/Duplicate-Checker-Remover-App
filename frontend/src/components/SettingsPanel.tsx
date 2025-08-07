import React, { useState, useEffect } from 'react';
import { Settings, FolderOpen, Save, Plus, Trash2, Edit, Download, Upload, RotateCcw } from 'lucide-react';
import { settingsService, SettingsData, CategoryRule } from '../services/settingsService';

const SettingsPanel: React.FC = () => {
  // Load settings from service on component mount
  const [settings, setSettings] = useState<SettingsData>(() => {
    return settingsService.loadSettings();
  });
  
  const [newRule, setNewRule] = useState<Omit<CategoryRule, 'id'>>({
    name: '',
    pattern: '',
    category: '',
    type: 'extension'
  });
  
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    settingsService.saveSettings(settings);
  }, [settings]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (already done by useEffect)
      // Optionally save to backend API
      await settingsService.saveSettingsToBackend(settings);
      showMessage('success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.pattern && newRule.category) {
      const newRuleWithId = { ...newRule, id: Date.now().toString() };
      setSettings(prev => ({
        ...prev,
        categoryRules: [...prev.categoryRules, newRuleWithId]
      }));
      setNewRule({ name: '', pattern: '', category: '', type: 'extension' });
      showMessage('success', 'Rule added successfully!');
    } else {
      showMessage('error', 'Please fill in all fields for the new rule.');
    }
  };

  const handleDeleteRule = (id: string) => {
    setSettings(prev => ({
      ...prev,
      categoryRules: prev.categoryRules.filter(rule => rule.id !== id)
    }));
    showMessage('success', 'Rule deleted successfully!');
  };

  const handleEditRule = (id: string) => {
    setEditingRule(editingRule === id ? null : id);
  };

  const handleUpdateRule = (id: string, updatedRule: Partial<CategoryRule>) => {
    setSettings(prev => ({
      ...prev,
      categoryRules: prev.categoryRules.map(rule => 
        rule.id === id ? { ...rule, ...updatedRule } : rule
      )
    }));
  };

  const handleDefaultScanPathChange = (path: string) => {
    setSettings(prev => ({
      ...prev,
      defaultScanPath: path
    }));
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      const defaultSettings = settingsService.resetSettings();
      setSettings(defaultSettings);
      showMessage('success', 'Settings reset to defaults!');
    }
  };

  const exportSettings = () => {
    try {
      const settingsJson = settingsService.exportSettings(settings);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'duplicate-remover-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'Settings exported successfully!');
    } catch (error) {
      console.error('Failed to export settings:', error);
      showMessage('error', 'Failed to export settings.');
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = settingsService.importSettings(content);
        setSettings(importedSettings);
        showMessage('success', 'Settings imported successfully!');
      } catch (error) {
        console.error('Failed to import settings:', error);
        showMessage('error', 'Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}


      {/* Category Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Categorization Rules
          </h4>
        </div>
        
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
          {settings.categoryRules.map((rule) => (
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
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;