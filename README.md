# Duplicate File Remover

A powerful, intelligent duplicate file detection and removal application with cross-format content comparison, real-time scanning, and advanced categorization capabilities.

## 🚀 Features

### 🔍 **Advanced Duplicate Detection**
- **Cross-Format Content Comparison**: Detect duplicates across different file formats (PDF ↔ DOCX, DOC ↔ TXT, etc.)
- **Metadata-Aware Hashing**: Ignores file metadata, focuses on actual content
- **SHA256 Content Hashing**: Secure and accurate duplicate identification
- **Real-Time Scanning**: Live progress tracking with detailed statistics

### 📁 **Smart File Categorization**
- **Content-Based Detection**: Uses magic numbers and file signatures
- **Custom Categorization Rules**: User-defined rules for file organization
- **Multiple Categories**: Images, Documents, Videos, Audio, Applications, Archives, etc.
- **Persistent Settings**: Rules saved across sessions

### 🎯 **Cross-Format Support**
- **PDF Files**: Full text extraction using Apache PDFBox
- **DOCX Files**: Content extraction using Apache POI
- **DOC Files**: Legacy Word format support
- **Text Files**: Direct content reading
- **Images**: Magic number detection (OCR ready for future)
- **Applications**: Executable file detection
- **Archives**: ZIP, RAR, 7Z format support

### 💾 **Persistent Settings Management**
- **localStorage Integration**: Automatic settings persistence
- **Import/Export**: JSON-based settings backup and restore
- **Reset to Defaults**: Easy restoration of default settings
- **Backend API Ready**: Server-side storage capability

### 📊 **Comprehensive Logging & Analytics**
- **Scan History**: Complete audit trail of all operations
- **Activity Timeline**: Detailed step-by-step operation logs
- **Statistics Dashboard**: Files processed, duplicates found, categories
- **Real-Time Progress**: Live scanning progress with ETA

### 🗂️ **Advanced File Management**
- **Bulk Operations**: Select and delete multiple files at once
- **Directory Duplicates**: Detect duplicate directory structures
- **Smart Selection**: Select all duplicates with one click
- **Safe Deletion**: Confirmation dialogs and error handling

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── FilesList.tsx   # Main file listing and management
│   │   ├── ScanForm.tsx    # Scan configuration and initiation
│   │   ├── SettingsPanel.tsx # Settings and categorization rules
│   │   ├── LogsPanel.tsx   # Activity logs and statistics
│   │   ├── RealTimeScan.tsx # Real-time scanning interface
│   │   └── CategoryView.tsx # Category-based file organization
│   ├── services/           # API and business logic
│   │   ├── api.ts         # HTTP client and API endpoints
│   │   ├── fileService.ts # File operation utilities
│   │   └── settingsService.ts # Settings management
│   └── types/             # TypeScript type definitions
```

### **Backend (Spring Boot + Java)**
```
backend/
├── src/main/java/com/duplicateremover/
│   ├── controller/         # REST API endpoints
│   │   └── FileScanController.java
│   ├── service/           # Business logic
│   │   ├── FileScanService.java    # Main scanning logic
│   │   ├── FileHashService.java    # Content hashing and extraction
│   │   └── FileCategoryService.java # File categorization
│   └── model/             # Data models
│       ├── FileInfo.java  # File metadata
│       └── ScanResult.java # Scan results
```

## 🛠️ Installation

### **Prerequisites**
- **Java 11+** (for backend)
- **Node.js 16+** (for frontend)
- **Maven** (for backend build)

### **Backend Setup**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd IBM_Hackathon

# Start backend
cd backend && mvn spring-boot:run

# Start frontend (in new terminal)
cd frontend && npm run dev

# Access the application
open http://localhost:5173
```

## 📖 Usage Guide

### **1. Initial Setup**
1. **Configure Settings**: Go to Settings panel to customize categorization rules
2. **Set Default Path**: Optionally set a default scan directory
3. **Import/Export**: Backup your settings using the export feature

### **2. Starting a Scan**
1. **Select Directory**: Choose the directory to scan for duplicates
2. **Configure Options**: Set scan depth and file type filters
3. **Start Scan**: Click "Start Scan" to begin the process
4. **Monitor Progress**: Watch real-time progress and statistics

### **3. Managing Duplicates**
1. **Review Results**: Browse files in different views (All Files, Duplicates, Directories)
2. **Select Files**: Choose which duplicates to remove
3. **Bulk Operations**: Use "Select All Duplicates" for mass selection
4. **Safe Deletion**: Confirm deletion with built-in safety checks

### **4. Advanced Features**
- **Cross-Format Detection**: PDF and DOCX with same content are detected as duplicates
- **Category Organization**: Files are automatically categorized by content
- **Persistent Settings**: Your rules and preferences are saved automatically

## 🔧 Technical Details

### **Cross-Format Duplicate Detection**

The system uses advanced content extraction to detect duplicates across different file formats:

```java
// PDF Content Extraction
private String extractPDFText(String filePath) throws IOException {
    try (PDDocument document = PDDocument.load(new File(filePath))) {
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);
        return DigestUtils.sha256Hex(text.getBytes("UTF-8"));
    }
}

// DOCX Content Extraction
private String extractDOCXText(String filePath) throws IOException {
    try (XWPFDocument document = new XWPFDocument(new FileInputStream(filePath))) {
        StringBuilder content = new StringBuilder();
        document.getParagraphs().forEach(paragraph -> {
            content.append(paragraph.getText()).append("\n");
        });
        return DigestUtils.sha256Hex(content.toString().getBytes("UTF-8"));
    }
}
```

### **Settings Persistence**

The frontend automatically saves settings using localStorage and optional backend storage:

```typescript
// Automatic persistence
useEffect(() => {
  settingsService.saveSettings(settings);
}, [settings]);

// Import/Export functionality
exportSettings(settings: SettingsData): string {
  return JSON.stringify(settings, null, 2);
}
```

### **Real-Time Progress Tracking**

The backend provides real-time progress updates during scanning:

```java
public static class ScanProgress {
    private String scanId;
    private String status;
    private int totalFiles;
    private int processedFiles;
    private int duplicateCount;
    private LocalDateTime startTime;
    private LocalDateTime lastUpdate;
    private String currentDirectory;
    private List<String> errors;
}
```

## 📊 Performance Features

### **Optimized Scanning**
- **Streaming Processing**: Files processed in streams to handle large directories
- **Memory Efficient**: Minimal memory footprint during scanning
- **Progress Tracking**: Real-time progress with detailed statistics
- **Error Handling**: Robust error handling with detailed logging

### **Smart Categorization**
- **Magic Number Detection**: Identifies file types by content signatures
- **Fallback Mechanisms**: Multiple detection methods for reliability
- **Custom Rules**: User-defined categorization patterns
- **Persistent Storage**: Settings saved across sessions

## 🔒 Security & Safety

### **Safe File Operations**
- **Confirmation Dialogs**: All deletions require user confirmation
- **Error Handling**: Comprehensive error handling and recovery
- **Logging**: Complete audit trail of all operations
- **Validation**: Input validation and sanitization

### **Data Protection**
- **Local Processing**: Files processed locally, no cloud upload
- **Secure Hashing**: SHA256 for accurate duplicate detection
- **Privacy Focused**: No data collection or tracking

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
mvn test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **Integration Testing**
```bash
# Start both servers
./start-servers.bat
```

## 📈 Monitoring & Logging

### **Activity Logs**
- **Scan History**: Complete record of all scans
- **Operation Timeline**: Step-by-step operation details
- **Error Tracking**: Detailed error logs with context
- **Performance Metrics**: Scan duration and file processing stats

### **Statistics Dashboard**
- **Total Scans**: Number of completed scans
- **Files Processed**: Total files analyzed
- **Duplicates Found**: Total duplicates detected
- **Categories**: Number of file categories identified

## 🔄 API Endpoints

### **Scan Management**
- `POST /api/scan` - Start a new scan
- `GET /api/scan/{scanId}` - Get scan results
- `GET /api/scan/{scanId}/progress` - Get scan progress
- `GET /api/scans` - Get all scans

### **File Operations**
- `DELETE /api/duplicates/{scanId}` - Delete duplicate files
- `DELETE /api/directories/{scanId}` - Delete duplicate directories

### **Settings Management**
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save user settings

## 🛠️ Configuration

### **Backend Configuration**
```properties
# application.properties
server.port=8080
logging.level.com.duplicateremover=DEBUG
spring.jackson.default-property-inclusion=non_null
```

### **Frontend Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

## 🚀 Deployment

### **Development**
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm run dev
```

### **Production**
```bash
# Build backend
cd backend && mvn clean package
java -jar target/duplicate-app-remover-1.0.0.jar

# Build frontend
cd frontend && npm run build
# Serve dist/ folder with any web server
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apache PDFBox** for PDF text extraction
- **Apache POI** for Office document handling
- **Spring Boot** for robust backend framework
- **React** for modern frontend development
- **Tailwind CSS** for beautiful UI components

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for efficient file management and duplicate detection**