package com.duplicateremover.service;

import com.duplicateremover.model.FileInfo;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FileCategoryService {

    private final Map<String, String> extensionCategories = new HashMap<>();

    public FileCategoryService() {
        initializeCategories();
    }

    private void initializeCategories() {
        // Application categories
        extensionCategories.put("exe", "Applications");
        extensionCategories.put("msi", "Applications");
        extensionCategories.put("app", "Applications");
        extensionCategories.put("deb", "Applications");
        extensionCategories.put("rpm", "Applications");
        extensionCategories.put("dmg", "Applications");

        // Document categories
        extensionCategories.put("pdf", "Documents");
        extensionCategories.put("doc", "Documents");
        extensionCategories.put("docx", "Documents");
        extensionCategories.put("txt", "Documents");
        extensionCategories.put("rtf", "Documents");

        // Image categories
        extensionCategories.put("jpg", "Images");
        extensionCategories.put("jpeg", "Images");
        extensionCategories.put("png", "Images");
        extensionCategories.put("gif", "Images");
        extensionCategories.put("bmp", "Images");

        // Video categories
        extensionCategories.put("mp4", "Videos");
        extensionCategories.put("avi", "Videos");
        extensionCategories.put("mov", "Videos");
        extensionCategories.put("mkv", "Videos");

        // Audio categories
        extensionCategories.put("mp3", "Audio");
        extensionCategories.put("wav", "Audio");
        extensionCategories.put("flac", "Audio");

        // Archive categories
        extensionCategories.put("zip", "Archives");
        extensionCategories.put("rar", "Archives");
        extensionCategories.put("7z", "Archives");
        extensionCategories.put("tar", "Archives");
    }

    public List<FileInfo> categorizeFiles(List<FileInfo> files) {
        for (FileInfo file : files) {
            String category = categorizeFile(file);
            file.setCategory(category);
        }
        return files;
    }

    private String categorizeFile(FileInfo fileInfo) {
        String extension = fileInfo.getExtension().toLowerCase();
        
        // Check by extension first
        String category = extensionCategories.get(extension);
        if (category != null) {
            return category;
        }

        // Check by filename patterns
        String fileName = fileInfo.getFileName().toLowerCase();
        if (fileName.contains("setup") || fileName.contains("install")) {
            return "Installers";
        }

        if (fileName.startsWith("temp") || fileName.startsWith("tmp")) {
            return "Temporary";
        }

        return "Others";
    }
}