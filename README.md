# Duplicate Application Remover

A full-stack web application for detecting and removing duplicate applications using content-based analysis with SHA-256 hashing.

## 🚀 Features

### Backend (Java Spring Boot)
- **Directory Scanning**: Recursively scan specified directories
- **SHA-256 Hashing**: Generate unique content hashes for duplicate detection
- **Rule-based Categorization**: Organize files by type, extension, and patterns
- **Real-time Progress Tracking**: Monitor scan progress and duplicate detection in real-time
- **RESTful API**: Complete API for scan operations, file management, and logging
- **Comprehensive Logging**: Track all operations with detailed logs
- **File Deletion**: Secure deletion of selected duplicate files

### Frontend (React + TypeScript)
- **Intuitive Interface**: Modern, responsive design with beautiful animations
- **Real-time Scanning**: Live updates during scan operations with duplicate streaming
- **Visual Duplicate Detection**: Highlighted duplicate groups with detailed information
- **Category Management**: Organize files by type with visual categorization
- **Batch Operations**: Select and delete multiple duplicates at once
- **Settings Panel**: Configure scan paths and categorization rules
- **Activity Logs**: Complete history of all scan operations

## 🆕 Real-Time Scanning Feature

The application now supports **real-time duplicate detection** during scanning:

### Real-Time Features
- **Live Progress Tracking**: See scan progress with percentage completion
- **Instant Duplicate Detection**: Duplicates appear as they are found during scanning
- **Real-time Statistics**: Watch file counts and duplicate counts update live
- **Pause/Resume**: Control real-time updates with pause/resume functionality
- **Error Tracking**: View processing errors in real-time
- **Smooth Animations**: Beautiful progress bars and status indicators

### How It Works
1. **Start Scan**: Enter directory path and click "Start Scan"
2. **Real-Time Monitoring**: Watch as files are processed and duplicates are detected
3. **Live Updates**: Progress bar, statistics, and duplicate list update automatically
4. **Complete Results**: Once scanning finishes, view full categorized results

## 🛠️ Tech Stack

### Backend
- Java 11+
- Spring Boot 2.7.0
- Apache Commons IO
- Apache Commons Codec
- Drools (rule engine)
- Maven

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Axios
- Vite

## 📋 Prerequisites

### Backend
- Java JDK 11 or higher
- Maven 3.6+

### Frontend
- Node.js 16+
- npm or yarn

## 🚀 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean package
```

3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5173

# File Upload Limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

### Frontend Configuration
The frontend automatically connects to the backend at `http://localhost:8080`. To change this, update the `API_BASE_URL` in `src/services/api.ts`.

## 📡 API Endpoints

### Scan Operations
- `POST /api/scan` - Start a new directory scan
- `GET /api/scan/{scanId}` - Get scan results by ID
- `GET /api/scan/{scanId}/progress` - Get real-time scan progress
- `GET /api/scan/{scanId}/duplicates/stream` - Get real-time duplicate stream
- `GET /api/scans` - Get all scan results

### File Management  
- `DELETE /api/duplicates/{scanId}` - Delete selected duplicate files

### System
- `GET /api/health` - Health check endpoint

## 🎯 Usage

### Real-Time Scanning
1. **Start a Scan**
   - Enter a directory path in the scan form
   - Click "Start Scan" to begin processing
   - Watch real-time progress and duplicate detection

2. **Monitor Progress**
   - View live progress bar and statistics
   - See duplicates appear as they are found
   - Monitor processing errors in real-time
   - Use pause/resume to control updates

3. **Review Results**
   - Navigate to the "Files" tab to see all scanned files
   - Duplicate files are highlighted in red
   - Use filters to show only duplicates

4. **Categorize Files**
   - Visit the "Categories" tab to see files organized by type
   - Each category shows file count and duplicate statistics

5. **Delete Duplicates**
   - Select duplicate files using checkboxes
   - Use "Select All Duplicates" for batch selection
   - Click "Delete Selected" to remove chosen files

6. **Configure Settings**
   - Set default scan directories
   - Add custom categorization rules
   - Configure file type patterns

7. **View Logs**
   - Check the "Logs" tab for scan history
   - Review detailed activity timelines
   - Filter logs by status or search terms

## 🏗️ Project Structure

```
├── backend/                    # Java Spring Boot backend
│   ├── src/main/java/com/duplicateremover/
│   │   ├── Application.java           # Main application class
│   │   ├── controller/               # REST controllers
│   │   ├── model/                   # Data models
│   │   ├── service/                 # Business logic
│   │   └── config/                  # Configuration classes
│   ├── src/main/resources/          # Configuration files
│   └── pom.xml                     # Maven dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── RealTimeScan.tsx     # Real-time scanning component
│   │   │   ├── ScanForm.tsx         # Directory scan form
│   │   │   ├── FilesList.tsx        # Files listing and management
│   │   │   ├── CategoryView.tsx     # Categorized files view
│   │   │   ├── SettingsPanel.tsx    # Settings configuration
│   │   │   └── LogsPanel.tsx        # Activity logs and history
│   │   ├── services/               # API service layer
│   │   ├── types/                  # TypeScript interfaces
│   │   └── App.tsx                 # Main app component
│   ├── public/                     # Static assets
│   └── package.json               # Node.js dependencies
│
└── README.md                  # This file
```

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with subtle animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Visual Feedback**: Loading states, progress indicators, and status updates
- **Color-coded Categories**: Easy identification of file types
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Real-time Updates**: Live progress tracking and duplicate streaming

## ⚠️ Important Notes

### WebContainer Limitations
This application is designed to run in a standard development environment. The Java backend requires a full JDK installation and cannot run in browser-based environments like WebContainer.

### File System Access
The application requires appropriate file system permissions to:
- Read files for scanning and hashing
- Delete duplicate files when requested
- Access directory structures recursively

### Security Considerations
- File deletion operations are irreversible
- Always backup important data before running bulk delete operations
- The application only deletes files explicitly selected by the user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the application logs for error details
2. Ensure all prerequisites are installed correctly
3. Verify file system permissions
4. Check network connectivity between frontend and backend

For additional support, please open an issue in the project repository.