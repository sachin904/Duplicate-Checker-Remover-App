# Duplicate Application Remover - Backend

This is the Java Spring Boot backend for the Duplicate Application Remover system.

## Features

- Directory scanning with SHA-256 hash generation
- Duplicate detection based on file content
- Rule-based file categorization
- RESTful API endpoints
- Comprehensive logging
- File deletion capabilities

## Prerequisites

- Java JDK 11 or higher
- Maven 3.6 or higher

## Dependencies

- Spring Boot Web
- Apache Commons IO
- Apache Commons Codec
- Drools (for rule-based categorization)
- Jackson (JSON processing)

## API Endpoints

### Start Scan
```
POST /api/scan
Content-Type: application/json

{
  "directory": "/path/to/scan"
}
```

### Get Scan Result
```
GET /api/scan/{scanId}
```

### Get All Scans
```
GET /api/scans
```

### Delete Duplicates
```
DELETE /api/duplicates/{scanId}
Content-Type: application/json

{
  "filePaths": ["/path/to/file1", "/path/to/file2"]
}
```

### Health Check
```
GET /api/health
```

## Building and Running

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean package
```

3. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Configuration

The application can be configured via `src/main/resources/application.properties`:

- `server.port`: Change the server port
- Logging levels and patterns
- File upload size limits
- CORS configuration

## Logging

All operations are logged with appropriate levels:
- INFO: General operation logs
- WARN: Non-critical issues
- ERROR: Critical errors

Logs include scan operations, file deletions, and error conditions.

## Project Structure

```
backend/
├── src/main/java/com/duplicateremover/
│   ├── Application.java                 # Main Spring Boot application
│   ├── controller/
│   │   └── FileScanController.java      # REST API controller
│   ├── model/
│   │   ├── FileInfo.java               # File information model
│   │   └── ScanResult.java             # Scan result model
│   └── service/
│       ├── FileCategoryService.java    # File categorization logic
│       ├── FileHashService.java        # SHA-256 hash generation
│       └── FileScanService.java        # Main scanning service
└── src/main/resources/
    └── application.properties          # Application configuration
```