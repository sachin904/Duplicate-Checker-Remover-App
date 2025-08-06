# Project Structure

This document outlines the complete structure of the Duplicate Application Remover project.

## 📁 Root Directory Structure

```
duplicate-app-remover/
├── backend/                    # Java Spring Boot backend
├── frontend/                   # React TypeScript frontend
├── README.md                   # Main project documentation
└── PROJECT_STRUCTURE.md       # This file
```

## 🔧 Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/duplicateremover/
│   │   │   ├── Application.java                 # Main Spring Boot application
│   │   │   ├── controller/
│   │   │   │   └── FileScanController.java      # REST API endpoints
│   │   │   ├── model/
│   │   │   │   ├── FileInfo.java               # File information model
│   │   │   │   └── ScanResult.java             # Scan result model
│   │   │   └── service/
│   │   │       ├── FileCategoryService.java    # File categorization logic
│   │   │       ├── FileHashService.java        # SHA-256 hash generation
│   │   │       └── FileScanService.java        # Main scanning service
│   │   └── resources/
│   │       └── application.properties          # Spring Boot configuration
│   └── test/                                   # Test files (to be added)
├── pom.xml                                     # Maven dependencies
└── README.md                                   # Backend documentation
```

## 🖥️ Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── ScanForm.tsx        # Directory scan form component
│   │   ├── FilesList.tsx       # Files listing and management
│   │   ├── CategoryView.tsx    # Categorized files view
│   │   ├── SettingsPanel.tsx   # Settings configuration panel
│   │   └── LogsPanel.tsx       # Activity logs and history
│   ├── services/               # API service layer
│   │   └── api.ts              # Backend API integration
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Interface definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global CSS styles
│   └── vite-env.d.ts           # Vite type definitions
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Node.js dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TypeScript config
├── tsconfig.node.json          # Node-specific TypeScript config
├── eslint.config.js            # ESLint configuration
├── vite.config.ts              # Vite build configuration
└── README.md                   # Frontend documentation
```

## 🔄 Data Flow

```
User Input (Directory Path)
    ↓
React Frontend (ScanForm)
    ↓
API Call (POST /api/scan)
    ↓
Spring Boot Backend (FileScanController)
    ↓
FileScanService
    ├── FileHashService (SHA-256 generation)
    └── FileCategoryService (Rule-based categorization)
    ↓
ScanResult (with duplicates and categories)
    ↓
API Response (JSON)
    ↓
React Frontend (FilesList, CategoryView)
    ↓
User Interface (Tables, Cards, Charts)
```

## 🗂️ Key Files and Their Purposes

### Backend Key Files

| File | Purpose |
|------|---------|
| `Application.java` | Spring Boot main application class |
| `FileScanController.java` | REST API endpoints for scan operations |
| `FileInfo.java` | Data model for individual file information |
| `ScanResult.java` | Data model for complete scan results |
| `FileScanService.java` | Core business logic for file scanning |
| `FileHashService.java` | SHA-256 hash generation for duplicate detection |
| `FileCategoryService.java` | Rule-based file categorization |
| `application.properties` | Spring Boot configuration |
| `pom.xml` | Maven dependencies and build configuration |

### Frontend Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main application component with routing |
| `ScanForm.tsx` | Directory input and scan initiation |
| `FilesList.tsx` | Display and manage scanned files |
| `CategoryView.tsx` | Categorized file organization |
| `SettingsPanel.tsx` | Configuration management |
| `LogsPanel.tsx` | Scan history and activity logs |
| `api.ts` | Backend API integration service |
| `types/index.ts` | TypeScript interface definitions |
| `package.json` | Dependencies and build scripts |
| `tailwind.config.js` | UI styling configuration |

## 🔧 Configuration Files

### Backend Configuration
- `application.properties`: Server port, CORS, logging, file upload limits
- `pom.xml`: Java dependencies, Spring Boot version, build plugins

### Frontend Configuration
- `package.json`: Node.js dependencies, build scripts
- `tsconfig.json`: TypeScript compiler options
- `tailwind.config.js`: CSS framework configuration
- `vite.config.ts`: Build tool configuration
- `eslint.config.js`: Code linting rules

## 🚀 Build Outputs

### Backend Build Output
```
backend/target/
├── classes/                    # Compiled Java classes
├── generated-sources/          # Generated source files
└── duplicate-app-remover-1.0.0.jar  # Executable JAR file
```

### Frontend Build Output
```
frontend/dist/
├── assets/                     # Bundled CSS and JS files
├── index.html                  # Production HTML file
└── _redirects                  # Netlify routing configuration
```

## 📦 Dependencies Overview

### Backend Dependencies
- **Spring Boot**: Web framework and dependency injection
- **Apache Commons IO**: File handling utilities
- **Apache Commons Codec**: SHA-256 hashing
- **Drools**: Rule-based categorization engine
- **Jackson**: JSON serialization/deserialization

### Frontend Dependencies
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls
- **Vite**: Build tool and development server

## 🔐 Security Considerations

- **File System Access**: Backend requires appropriate permissions
- **CORS Configuration**: Properly configured for frontend-backend communication
- **Input Validation**: Directory paths validated before processing
- **Error Handling**: Comprehensive error handling throughout the application

## 🧪 Testing Structure (Future)

```
backend/src/test/
├── java/com/duplicateremover/
│   ├── controller/              # Controller tests
│   ├── service/                 # Service layer tests
│   └── integration/             # Integration tests

frontend/src/__tests__/
├── components/                  # Component tests
├── services/                    # API service tests
└── utils/                       # Utility function tests
```

This structure provides a clear separation of concerns, maintainable codebase, and scalable architecture for the Duplicate Application Remover system.