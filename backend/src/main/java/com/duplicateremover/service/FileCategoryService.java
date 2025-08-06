package com.duplicateremover.service;

import com.duplicateremover.model.FileInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class FileCategoryService {

    private static final Logger logger = LoggerFactory.getLogger(FileCategoryService.class);

    @Autowired
    private FileHashService fileHashService;

    /**
     * Categorizes files based on their content rather than extensions
     */
    public List<FileInfo> categorizeFiles(List<FileInfo> files) {
        for (FileInfo file : files) {
            String category = categorizeFileByContent(file);
            file.setCategory(category);
        }
        return files;
    }

    /**
     * Categorizes a single file based on its content using magic number detection
     */
    private String categorizeFileByContent(FileInfo fileInfo) {
        try {
            // Use content-based detection from FileHashService
            String contentBasedCategory = fileHashService.detectFileTypeFromContent(fileInfo.getFilePath());
            
            // If content detection fails or returns Unknown, fall back to filename patterns
            if ("Unknown".equals(contentBasedCategory)) {
                return categorizeByFilenamePatterns(fileInfo.getFileName());
            }
            
            logger.debug("File {} categorized as {} based on content", fileInfo.getFileName(), contentBasedCategory);
            return contentBasedCategory;
            
        } catch (Exception e) {
            logger.warn("Failed to categorize file by content: {}, falling back to filename patterns", 
                       fileInfo.getFileName(), e);
            return categorizeByFilenamePatterns(fileInfo.getFileName());
        }
    }

    /**
     * Fallback categorization based on filename patterns when content detection fails
     */
    private String categorizeByFilenamePatterns(String fileName) {
        String lowerFileName = fileName.toLowerCase();
        
        // Check for installer patterns
        if (lowerFileName.contains("setup") || lowerFileName.contains("install") || 
            lowerFileName.contains("installer") || lowerFileName.endsWith(".msi")) {
            return "Applications";
        }

        // Check for temporary file patterns
        if (lowerFileName.startsWith("temp") || lowerFileName.startsWith("tmp") ||
            lowerFileName.startsWith("~") || lowerFileName.endsWith(".tmp") ||
            lowerFileName.endsWith(".temp")) {
            return "Temporary";
        }

        // Check for backup patterns
        if (lowerFileName.contains("backup") || lowerFileName.contains(".bak") ||
            lowerFileName.endsWith("~") || lowerFileName.contains("copy")) {
            return "Backups";
        }

        // Check for system files
        if (lowerFileName.startsWith(".") || lowerFileName.contains("system") ||
            lowerFileName.contains("config") || lowerFileName.endsWith(".sys") ||
            lowerFileName.endsWith(".dll")) {
            return "System";
        }

        // Check for log files
        if (lowerFileName.contains("log") || lowerFileName.endsWith(".log") ||
            lowerFileName.endsWith(".out") || lowerFileName.contains("error")) {
            return "Logs";
        }

        return "Others";
    }
}
