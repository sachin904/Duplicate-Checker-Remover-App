package com.duplicateremover.service;

import com.duplicateremover.model.FileInfo;
import com.duplicateremover.model.ScanResult;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileScanService {

    private static final Logger logger = LoggerFactory.getLogger(FileScanService.class);

    @Autowired
    private FileHashService fileHashService;

    @Autowired
    private FileCategoryService categoryService;

    private final Map<String, ScanResult> scanResults = new ConcurrentHashMap<>();
    private final Map<String, ScanProgress> scanProgress = new ConcurrentHashMap<>();
    private final Map<String, List<FileInfo>> currentDuplicates = new ConcurrentHashMap<>();

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

        public ScanProgress(String scanId) {
            this.scanId = scanId;
            this.status = "STARTED";
            this.totalFiles = 0;
            this.processedFiles = 0;
            this.duplicateCount = 0;
            this.startTime = LocalDateTime.now();
            this.lastUpdate = LocalDateTime.now();
            this.errors = new ArrayList<>();
        }

        // Getters and Setters
        public String getScanId() { return scanId; }
        public void setScanId(String scanId) { this.scanId = scanId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getTotalFiles() { return totalFiles; }
        public void setTotalFiles(int totalFiles) { this.totalFiles = totalFiles; }

        public int getProcessedFiles() { return processedFiles; }
        public void setProcessedFiles(int processedFiles) { this.processedFiles = processedFiles; }

        public int getDuplicateCount() { return duplicateCount; }
        public void setDuplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getLastUpdate() { return lastUpdate; }
        public void setLastUpdate(LocalDateTime lastUpdate) { this.lastUpdate = lastUpdate; }

        public String getCurrentDirectory() { return currentDirectory; }
        public void setCurrentDirectory(String currentDirectory) { this.currentDirectory = currentDirectory; }

        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }

        public double getProgressPercentage() {
            if (totalFiles == 0) return 0.0;
            return (double) processedFiles / totalFiles * 100.0;
        }
    }

    public String startScan(String directory) {
        String scanId = UUID.randomUUID().toString();
        logger.info("Starting scan for directory: {} with scanId: {}", directory, scanId);

        // Initialize progress tracking
        ScanProgress progress = new ScanProgress(scanId);
        scanProgress.put(scanId, progress);
        currentDuplicates.put(scanId, new ArrayList<>());

        // Start scanning in a separate thread to allow real-time updates
        new Thread(() -> {
            try {
                performScanWithProgress(scanId, directory);
            } catch (Exception e) {
                logger.error("Error during scan for directory: {}", directory, e);
                progress.setStatus("FAILED");
                progress.getErrors().add(e.getMessage());
            }
        }).start();

        return scanId;
    }

    private void performScanWithProgress(String scanId, String directory) throws IOException {
        ScanProgress progress = scanProgress.get(scanId);
        if (progress == null) {
            throw new IllegalStateException("Progress tracking not initialized for scanId: " + scanId);
        }
        
        progress.setStatus("SCANNING");
        progress.setCurrentDirectory(directory);

        Path directoryPath = Paths.get(directory);
        
        if (!Files.exists(directoryPath) || !Files.isDirectory(directoryPath)) {
            throw new IllegalArgumentException("Directory does not exist or is not a directory: " + directory);
        }

        List<FileInfo> allFiles = new ArrayList<>();
        Map<String, List<FileInfo>> hashGroups = new HashMap<>();
        List<FileInfo> duplicates = new ArrayList<>();

        try (Stream<Path> paths = Files.walk(directoryPath)) {
            List<Path> filePaths = paths.filter(Files::isRegularFile)
                                       .collect(Collectors.toList());

            progress.setTotalFiles(filePaths.size());
            logger.info("Found {} files to process", filePaths.size());

            for (int i = 0; i < filePaths.size(); i++) {
                Path filePath = filePaths.get(i);
                try {
                    FileInfo fileInfo = createFileInfo(filePath);
                    allFiles.add(fileInfo);
                    
                    // Update progress
                    progress.setProcessedFiles(i + 1);
                    progress.setLastUpdate(LocalDateTime.now());

                    // Check for duplicates in real-time
                    String hash = fileInfo.getHash();
                    if (hash != null && !hash.isEmpty()) {
                        if (hashGroups.containsKey(hash)) {
                            // Found a duplicate
                            List<FileInfo> group = hashGroups.get(hash);
                            group.add(fileInfo);
                            fileInfo.setDuplicate(true);
                            
                            // Mark all files in the group as duplicates
                            for (FileInfo existingFile : group) {
                                existingFile.setDuplicate(true);
                            }
                            
                            // Update duplicate count
                            progress.setDuplicateCount(progress.getDuplicateCount() + 1);
                            
                            // Add to current duplicates list (only add the new duplicate)
                            duplicates.add(fileInfo);
                            currentDuplicates.put(scanId, new ArrayList<>(duplicates));
                            
                            logger.debug("Found duplicate: {}", fileInfo.getFileName());
                        } else {
                            // New hash, create a new group
                            List<FileInfo> newGroup = new ArrayList<>();
                            newGroup.add(fileInfo);
                            hashGroups.put(hash, newGroup);
                        }
                    } else {
                        logger.warn("Skipping file with null/empty hash: {}", filePath);
                        progress.getErrors().add("Invalid hash for file: " + filePath.toString());
                    }

                    // Update progress every 10 files or for duplicates
                    if ((i + 1) % 10 == 0 || fileInfo.isDuplicate()) {
                        progress.setLastUpdate(LocalDateTime.now());
                    }

                } catch (IOException e) {
                    logger.warn("Failed to process file: {}", filePath, e);
                    progress.getErrors().add("Failed to process: " + filePath.toString() + " - " + e.getMessage());
                } catch (Exception e) {
                    logger.error("Unexpected error processing file: {}", filePath, e);
                    progress.getErrors().add("Unexpected error: " + filePath.toString() + " - " + e.getMessage());
                }
            }
        }

        // Categorize files
        List<FileInfo> categorizedFiles = categoryService.categorizeFiles(allFiles);
        Map<String, List<FileInfo>> categorizedGroups = categorizedFiles.stream()
                .collect(Collectors.groupingBy(FileInfo::getCategory));

        // Create final duplicate groups
        Map<String, List<FileInfo>> duplicateGroups = hashGroups.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        // Create scan result
        ScanResult scanResult = new ScanResult(scanId, directory, LocalDateTime.now());
        scanResult.setFiles(categorizedFiles);
        scanResult.setDuplicateGroups(duplicateGroups);
        scanResult.setCategorizedFiles(categorizedGroups);
        scanResult.setTotalFiles(allFiles.size());
        scanResult.setDuplicateCount(duplicateGroups.values().stream()
                .mapToInt(group -> group.size() - 1)
                .sum());

        // Update final status
        progress.setStatus("COMPLETED");
        progress.setLastUpdate(LocalDateTime.now());
        scanResults.put(scanId, scanResult);
        
        logger.info("Scan completed successfully for scanId: {}", scanId);
    }

    public Map<String, Object> getScanProgress(String scanId) {
        ScanProgress progress = scanProgress.get(scanId);
        if (progress == null) {
            return null;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("scanId", progress.getScanId());
        result.put("status", progress.getStatus());
        result.put("totalFiles", progress.getTotalFiles());
        result.put("processedFiles", progress.getProcessedFiles());
        result.put("duplicateCount", progress.getDuplicateCount());
        result.put("progressPercentage", progress.getProgressPercentage());
        result.put("startTime", progress.getStartTime());
        result.put("lastUpdate", progress.getLastUpdate());
        result.put("currentDirectory", progress.getCurrentDirectory());
        result.put("errors", progress.getErrors());

        return result;
    }

    public List<FileInfo> getCurrentDuplicates(String scanId) {
        return currentDuplicates.get(scanId);
    }

    private FileInfo createFileInfo(Path filePath) throws IOException {
        File file = filePath.toFile();
        String fileName = file.getName();
        String extension = getFileExtension(fileName);
        String hash = fileHashService.generateSHA256Hash(file.getAbsolutePath());
        long size = file.length();
        LocalDateTime lastModified = LocalDateTime.ofInstant(
                Files.getLastModifiedTime(filePath).toInstant(),
                ZoneId.systemDefault()
        );

        return new FileInfo(
                file.getAbsolutePath(),
                fileName,
                hash,
                size,
                extension,
                lastModified
        );
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : "";
    }

    public ScanResult getScanResult(String scanId) {
        return scanResults.get(scanId);
    }

    public List<ScanResult> getAllScanResults() {
        return new ArrayList<>(scanResults.values());
    }

    public boolean deleteDuplicateFiles(String scanId, List<String> filePaths) {
        logger.info("Deleting duplicate files for scanId: {}", scanId);
        
        boolean allDeleted = true;
        for (String filePath : filePaths) {
            try {
                File file = new File(filePath);
                if (file.exists() && file.delete()) {
                    logger.info("Successfully deleted file: {}", filePath);
                } else {
                    logger.warn("Failed to delete file: {}", filePath);
                    allDeleted = false;
                }
            } catch (Exception e) {
                logger.error("Error deleting file: {}", filePath, e);
                allDeleted = false;
            }
        }
        
        return allDeleted;
    }
}