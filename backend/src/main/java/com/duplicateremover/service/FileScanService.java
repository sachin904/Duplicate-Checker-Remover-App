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

        // Create final duplicate groups with smart selection
        Map<String, List<FileInfo>> duplicateGroups = hashGroups.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> {
                    List<FileInfo> group = entry.getValue();
                    // Mark files for deletion (keep the first one as original)
                    for (int i = 1; i < group.size(); i++) {
                        group.get(i).setMarkedForDeletion(true);
                    }
                    return group;
                }));

        // Detect directory duplicates
        Map<String, List<FileInfo>> directoryDuplicates = detectDirectoryDuplicates(allFiles);

        // Create scan result
        ScanResult scanResult = new ScanResult(scanId, directory, LocalDateTime.now());
        scanResult.setFiles(categorizedFiles);
        scanResult.setDuplicateGroups(duplicateGroups);
        scanResult.setDirectoryDuplicates(directoryDuplicates);
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

    private Map<String, List<FileInfo>> detectDirectoryDuplicates(List<FileInfo> allFiles) {
        Map<String, List<FileInfo>> directoryGroups = new HashMap<>();
        
        // Group files by directory
        Map<String, List<FileInfo>> filesByDirectory = allFiles.stream()
                .collect(Collectors.groupingBy(file -> {
                    Path path = Paths.get(file.getFilePath());
                    return path.getParent().toString();
                }));

        // Create directory signatures for comparison
        Map<String, String> directorySignatures = new HashMap<>();
        
        for (Map.Entry<String, List<FileInfo>> entry : filesByDirectory.entrySet()) {
            String directory = entry.getKey();
            List<FileInfo> files = entry.getValue();
            
            // Create a signature for the directory based on file names, sizes, and hashes
            String directorySignature = files.stream()
                    .sorted(Comparator.comparing(FileInfo::getFileName))
                    .map(file -> file.getFileName() + ":" + file.getSize() + ":" + file.getHash())
                    .collect(Collectors.joining("|"));
            
            if (!directorySignature.isEmpty()) {
                directorySignatures.put(directory, directorySignature);
            }
        }

        // Group directories by signature
        Map<String, List<String>> signatureGroups = new HashMap<>();
        for (Map.Entry<String, String> entry : directorySignatures.entrySet()) {
            String directory = entry.getKey();
            String signature = entry.getValue();
            
            signatureGroups.computeIfAbsent(signature, k -> new ArrayList<>()).add(directory);
        }

        // Create directory duplicate groups
        for (Map.Entry<String, List<String>> entry : signatureGroups.entrySet()) {
            String signature = entry.getKey();
            List<String> directories = entry.getValue();
            
            if (directories.size() > 1) {
                // This is a duplicate directory group
                List<FileInfo> allFilesInGroup = new ArrayList<>();
                for (String directory : directories) {
                    List<FileInfo> filesInDir = filesByDirectory.get(directory);
                    if (filesInDir != null) {
                        allFilesInGroup.addAll(filesInDir);
                    }
                }
                directoryGroups.put(signature, allFilesInGroup);
            }
        }

        logger.info("Found {} duplicate directory groups", directoryGroups.size());
        return directoryGroups;
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
        String hash = fileHashService.generateSHA256Hash(file.getAbsolutePath());
        long size = file.length();
        LocalDateTime createdTime = LocalDateTime.ofInstant(
                Files.getLastModifiedTime(filePath).toInstant(),
                ZoneId.systemDefault()
        );

        return new FileInfo(
                file.getAbsolutePath(),
                fileName,
                hash,
                size,
                createdTime
        );
    }

    public ScanResult getScanResult(String scanId) {
        return scanResults.get(scanId);
    }

    public List<ScanResult> getAllScanResults() {
        return new ArrayList<>(scanResults.values());
    }

    /**
     * Permanently deletes duplicate files
     * WARNING: This operation cannot be undone!
     */
    public boolean deleteDuplicateFiles(String scanId, List<String> filePaths) {
        logger.info("Permanently deleting {} files for scanId: {}", filePaths.size(), scanId);
        
        boolean allDeleted = true;
        int successCount = 0;
        int failureCount = 0;
        
        // Get the scan result to update it after deletion
        ScanResult scanResult = scanResults.get(scanId);
        if (scanResult == null) {
            logger.error("Scan result not found for scanId: {}", scanId);
            return false;
        }
        
        List<String> successfullyDeletedFiles = new ArrayList<>();
        
        for (String filePath : filePaths) {
            try {
                File fileToDelete = new File(filePath);
                logger.info("Attempting to permanently delete file: {}", filePath);
                
                if (!fileToDelete.exists()) {
                    logger.warn("File does not exist: {}", filePath);
                    failureCount++;
                    continue;
                }
                
                if (!fileToDelete.isFile()) {
                    logger.warn("Path is not a file: {}", filePath);
                    failureCount++;
                    continue;
                }
                
                // Check if file is writable/deletable
                if (!fileToDelete.canWrite()) {
                    logger.warn("No write permission for file: {}", filePath);
                    failureCount++;
                    allDeleted = false;
                    continue;
                }
                
                try {
                    // Attempt direct deletion
                    if (fileToDelete.delete()) {
                        logger.info("Successfully permanently deleted file: {}", filePath);
                        successCount++;
                        successfullyDeletedFiles.add(filePath);
                    } else {
                        // If direct deletion fails, try to make it writable first
                        logger.warn("Direct deletion failed, trying to make file writable: {}", filePath);
                        if (fileToDelete.setWritable(true) && fileToDelete.delete()) {
                            logger.info("Successfully deleted file after setting writable: {}", filePath);
                            successCount++;
                            successfullyDeletedFiles.add(filePath);
                        } else {
                            logger.error("Failed to permanently delete file: {}", filePath);
                            failureCount++;
                            allDeleted = false;
                        }
                    }
                } catch (SecurityException e) {
                    logger.error("Security exception deleting file: {}", filePath, e);
                    allDeleted = false;
                    failureCount++;
                }
            } catch (Exception e) {
                logger.error("Unexpected error deleting file: {}", filePath, e);
                allDeleted = false;
                failureCount++;
            }
        }
        
        // Update the scan result to remove successfully deleted files
        if (!successfullyDeletedFiles.isEmpty()) {
            updateScanResultAfterDeletion(scanResult, successfullyDeletedFiles);
        }
        
        logger.info("Permanent file deletion completed. Success: {}, Failed: {}, All successful: {}", 
                   successCount, failureCount, allDeleted);
        
        // Return true if at least some files were successfully deleted
        return successCount > 0;
    }

    /**
     * Permanently deletes duplicate directories
     * WARNING: This operation cannot be undone!
     */
    public boolean deleteDirectories(String scanId, List<String> directoryPaths) {
        logger.info("Permanently deleting {} directories for scanId: {}", directoryPaths.size(), scanId);
        
        boolean allDeleted = true;
        int successCount = 0;
        int failureCount = 0;
        
        for (String directoryPath : directoryPaths) {
            try {
                File dirToDelete = new File(directoryPath);
                logger.info("Attempting to permanently delete directory: {}", directoryPath);
                
                if (!dirToDelete.exists()) {
                    logger.warn("Directory does not exist: {}", directoryPath);
                    failureCount++;
                    continue;
                }
                
                if (!dirToDelete.isDirectory()) {
                    logger.warn("Path is not a directory: {}", directoryPath);
                    failureCount++;
                    continue;
                }
                
                // Check if directory is accessible
                if (!dirToDelete.canRead() || !dirToDelete.canWrite()) {
                    logger.warn("No read/write permission for directory: {}", directoryPath);
                    failureCount++;
                    allDeleted = false;
                    continue;
                }
                
                try {
                    // Recursively delete directory using FileUtils
                    FileUtils.deleteDirectory(dirToDelete);
                    logger.info("Successfully permanently deleted directory: {}", directoryPath);
                    successCount++;
                } catch (IOException e) {
                    logger.error("Failed to permanently delete directory: {}", directoryPath, e);
                    failureCount++;
                    allDeleted = false;
                } catch (SecurityException e) {
                    logger.error("Security exception deleting directory: {}", directoryPath, e);
                    allDeleted = false;
                    failureCount++;
                }
            } catch (Exception e) {
                logger.error("Unexpected error deleting directory: {}", directoryPath, e);
                allDeleted = false;
                failureCount++;
            }
        }
        
        logger.info("Permanent directory deletion completed. Success: {}, Failed: {}, All successful: {}", 
                   successCount, failureCount, allDeleted);
        
        return successCount > 0;
    }

    private void updateScanResultAfterDeletion(ScanResult scanResult, List<String> deletedFilePaths) {
        logger.info("Updating scan result after deletion of {} files", deletedFilePaths.size());
        
        // Remove deleted files from the main files list
        List<FileInfo> updatedFiles = scanResult.getFiles().stream()
                .filter(file -> !deletedFilePaths.contains(file.getFilePath()))
                .collect(Collectors.toList());
        scanResult.setFiles(updatedFiles);
        
        // Update duplicate groups - remove deleted files and clean up empty groups
        Map<String, List<FileInfo>> updatedDuplicateGroups = new HashMap<>();
        for (Map.Entry<String, List<FileInfo>> entry : scanResult.getDuplicateGroups().entrySet()) {
            List<FileInfo> filteredGroup = entry.getValue().stream()
                    .filter(file -> !deletedFilePaths.contains(file.getFilePath()))
                    .collect(Collectors.toList());
            
            // Only keep groups that still have duplicates (more than 1 file)
            if (filteredGroup.size() > 1) {
                updatedDuplicateGroups.put(entry.getKey(), filteredGroup);
            }
        }
        scanResult.setDuplicateGroups(updatedDuplicateGroups);
        
        // Update categorized files
        Map<String, List<FileInfo>> updatedCategorizedFiles = new HashMap<>();
        for (Map.Entry<String, List<FileInfo>> entry : scanResult.getCategorizedFiles().entrySet()) {
            List<FileInfo> filteredCategoryFiles = entry.getValue().stream()
                    .filter(file -> !deletedFilePaths.contains(file.getFilePath()))
                    .collect(Collectors.toList());
            
            if (!filteredCategoryFiles.isEmpty()) {
                updatedCategorizedFiles.put(entry.getKey(), filteredCategoryFiles);
            }
        }
        scanResult.setCategorizedFiles(updatedCategorizedFiles);
        
        // Update duplicate status on remaining files
        // Group files by hash to determine which ones are still duplicates
        Map<String, List<FileInfo>> filesByHash = updatedFiles.stream()
                .collect(Collectors.groupingBy(FileInfo::getHash));
        
        // Update duplicate status for each file
        for (FileInfo file : updatedFiles) {
            List<FileInfo> filesWithSameHash = filesByHash.get(file.getHash());
            boolean wasDuplicate = file.isDuplicate();
            if (filesWithSameHash != null && filesWithSameHash.size() <= 1) {
                // Only one file with this hash, so it's unique now
                file.setDuplicate(false);
                if (wasDuplicate) {
                    logger.info("File {} is now unique (was duplicate)", file.getFileName());
                }
            } else if (filesWithSameHash != null && filesWithSameHash.size() > 1) {
                // Multiple files with same hash, so they are duplicates
                file.setDuplicate(true);
                if (!wasDuplicate) {
                    logger.info("File {} is now duplicate (was unique)", file.getFileName());
                }
            }
        }
        
        // Recalculate counts
        scanResult.setTotalFiles(updatedFiles.size());
        int newDuplicateCount = updatedDuplicateGroups.values().stream()
                .mapToInt(group -> group.size() - 1)
                .sum();
        scanResult.setDuplicateCount(newDuplicateCount);
        
        // Log final state
        int uniqueFiles = (int) updatedFiles.stream().filter(f -> !f.isDuplicate()).count();
        int duplicateFiles = (int) updatedFiles.stream().filter(f -> f.isDuplicate()).count();
        
        logger.info("Scan result updated. New totals - Files: {}, Unique: {}, Duplicates: {}, Duplicate Groups: {}", 
                   updatedFiles.size(), uniqueFiles, duplicateFiles, newDuplicateCount);
    }
}
