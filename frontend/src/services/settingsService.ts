import axios from 'axios';

export interface CategoryRule {
  id: string;
  name: string;
  pattern: string;
  category: string;
  type: 'extension' | 'filename' | 'path';
}

export interface SettingsData {
  defaultScanPath: string;
  categoryRules: CategoryRule[];
}

class SettingsService {
  private readonly STORAGE_KEY = 'duplicateRemoverSettings';
  private readonly API_BASE_URL = 'http://localhost:8080/api';

  /**
   * Load settings from localStorage
   */
  loadSettings(): SettingsData {
    const savedSettings = localStorage.getItem(this.STORAGE_KEY);
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    
    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings: SettingsData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      throw error;
    }
  }

  /**
   * Save settings to backend API
   */
  async saveSettingsToBackend(settings: SettingsData): Promise<void> {
    try {
      await axios.post(`${this.API_BASE_URL}/settings`, settings);
    } catch (error) {
      console.error('Failed to save settings to backend:', error);
      throw error;
    }
  }

  /**
   * Load settings from backend API
   */
  async loadSettingsFromBackend(): Promise<SettingsData | null> {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to load settings from backend:', error);
      return null;
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings(): SettingsData {
    return {
      defaultScanPath: '',
      categoryRules: [
        { id: '1', name: 'Executable Files', pattern: 'exe,msi,app', category: 'Applications', type: 'extension' },
        { id: '2', name: 'Setup Files', pattern: '*setup*,*install*', category: 'Installers', type: 'filename' },
        { id: '3', name: 'Document Files', pattern: 'pdf,doc,docx,txt', category: 'Documents', type: 'extension' },
        { id: '4', name: 'Image Files', pattern: 'jpg,jpeg,png,gif,bmp', category: 'Images', type: 'extension' },
        { id: '5', name: 'Video Files', pattern: 'mp4,avi,mov,wmv,flv', category: 'Videos', type: 'extension' },
        { id: '6', name: 'Audio Files', pattern: 'mp3,wav,flac,aac,ogg', category: 'Audio', type: 'extension' },
        { id: '7', name: 'Archive Files', pattern: 'zip,rar,7z,tar,gz', category: 'Archives', type: 'extension' },
      ]
    };
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): SettingsData {
    const defaultSettings = this.getDefaultSettings();
    this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  /**
   * Export settings as JSON
   */
  exportSettings(settings: SettingsData): string {
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(jsonString: string): SettingsData {
    try {
      const settings = JSON.parse(jsonString);
      // Validate the imported settings
      if (this.validateSettings(settings)) {
        return settings;
      } else {
        throw new Error('Invalid settings format');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings file format');
    }
  }

  /**
   * Validate settings structure
   */
  private validateSettings(settings: any): settings is SettingsData {
    return (
      typeof settings === 'object' &&
      typeof settings.defaultScanPath === 'string' &&
      Array.isArray(settings.categoryRules) &&
      settings.categoryRules.every((rule: any) =>
        typeof rule === 'object' &&
        typeof rule.id === 'string' &&
        typeof rule.name === 'string' &&
        typeof rule.pattern === 'string' &&
        typeof rule.category === 'string' &&
        ['extension', 'filename', 'path'].includes(rule.type)
      )
    );
  }
}

export const settingsService = new SettingsService();
