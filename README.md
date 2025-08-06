# Duplicate Application Remover

A full-stack web application for detecting and removing duplicate applications using content-based analysis with SHA-256 hashing.

## 🚀 Features

### Backend (Java Spring Boot)
- **Directory Scanning**: Recursively scan specified directories
- **SHA-256 Hashing**: Generate unique content hashes for duplicate detection
- **Rule-based Categorization**: Organize files by type, extension, and patterns
- **RESTful API**: Complete API for scan operations, file management, and logging
- **Comprehensive Logging**: Track all operations with detailed logs
- **File Deletion**: Secure deletion of selected duplicate files

### Frontend (React + TypeScript)
- **Intuitive Interface**: Modern, responsive design with beautiful animations
- **Real-time Scanning**: Live updates during scan operations
- **Visual Duplicate Detection**: Highlighted duplicate groups with detailed information
- **Category Management**: Organize files by type with visual categorization
- **Batch Operations**: Select and delete multiple duplicates at once
- **Settings Panel**: Configure scan paths and categorization rules
- **Activity Logs**: Complete history of all scan operations

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
- `GET /api/scans` - Get all scan results

### File Management  
- `DELETE /api/duplicates/{scanId}` - Delete selected duplicate files

### System
- `GET /api/health` - Health check endpoint

## 🎯 Usage

1. **Start a Scan**
   - Enter a directory path in the scan form
   - Click "Start Scan" to begin processing
   - View real-time results as they appear

2. **Review Results**
   - Navigate to the "Files" tab to see all scanned files
   - Duplicate files are highlighted in red
   - Use filters to show only duplicates

3. **Categorize Files**
   - Visit the "Categories" tab to see files organized by type
   - Each category shows file count and duplicate statistics

4. **Delete Duplicates**
   - Select duplicate files using checkboxes
   - Use "Select All Duplicates" for batch selection
   - Click "Delete Selected" to remove chosen files

5. **Configure Settings**
   - Set default scan directories
   - Add custom categorization rules
   - Configure file type patterns

6. **View Logs**
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