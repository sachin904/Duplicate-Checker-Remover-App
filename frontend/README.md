# Duplicate Application Remover - Frontend

A modern React frontend for the Duplicate Application Remover system.

## 🚀 Features

- **Intuitive Interface**: Modern, responsive design with beautiful animations
- **Real-time Scanning**: Live updates during scan operations
- **Visual Duplicate Detection**: Highlighted duplicate groups with detailed information
- **Category Management**: Organize files by type with visual categorization
- **Batch Operations**: Select and delete multiple duplicates at once
- **Settings Panel**: Configure scan paths and categorization rules
- **Activity Logs**: Complete history of all scan operations

## 🛠️ Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Axios
- Vite

## 📋 Prerequisites

- Node.js 16+
- npm or yarn

## 🚀 Installation & Setup

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

The frontend automatically connects to the backend at `http://localhost:8080`. To change this, update the `API_BASE_URL` in `src/services/api.ts`.

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

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with subtle animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Visual Feedback**: Loading states, progress indicators, and status updates
- **Color-coded Categories**: Easy identification of file types
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── ScanForm.tsx        # Directory scan form
│   │   ├── FilesList.tsx       # Files listing and management
│   │   ├── CategoryView.tsx    # Categorized files view
│   │   ├── SettingsPanel.tsx   # Settings configuration
│   │   └── LogsPanel.tsx       # Activity logs and history
│   ├── services/               # API service layer
│   │   └── api.ts              # Backend API integration
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts            # Type definitions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## 🔗 API Integration

The frontend communicates with the Java backend through REST APIs:

- `POST /api/scan` - Start directory scan
- `GET /api/scan/{scanId}` - Get scan results
- `GET /api/scans` - Get all scans
- `DELETE /api/duplicates/{scanId}` - Delete duplicate files
- `GET /api/health` - Health check

## 🚀 Build & Deploy

1. Build for production:
```bash
npm run build
```

2. Preview production build:
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.