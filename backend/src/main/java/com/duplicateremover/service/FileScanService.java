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
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileScanService {

    private static final Logger logger = LoggerFactory.getLogger(FileScanService.class);

    @Autowired
    private FileHashService fileHashService;

    @Autowired
    private FileCategoryService categoryService;

    private final Map<String, ScanResult> scanResults = new HashMap<>();

    public String startScan(String directory) {
        String scanId = UUID.randomUUID().toString();
        logger.info("Starting scan for directory: {} with scanId: {}", directory, scanId);

        try {
            ScanResult scanResult = performScan(scanId, directory);
            scanResults.put(scanId, scanResult);
            logger.info("Scan completed successfully for scanId: {}", scanId);
            return scanId;
        } catch (Exception e) {
            logger.error("Error during scan for directory: {}", directory, e);
            ScanResult errorResult = new ScanResult(scanId, directory, LocalDateTime.now());
            errorResult.setStatus("FAILED");
            scanResults.put(scanId, errorResult);
            throw new RuntimeException("Scan failed: " + e.getMessage());
        }
    }

    private ScanResult performScan(String scanId, String directory) throws IOException {
        Path directoryPath = Paths.get(directory);
        
        if (!Files.exists(directoryPath) || !Files.isDirectory(directoryPath)) {
            throw new IllegalArgumentException("Directory does not exist or is not a directory: " + directory);
        }

        List<FileInfo> allFiles = new ArrayList<>();

        try (Stream<Path> paths = Files.walk(directoryPath)) {
            List<Path> filePaths = paths.filter(Files::isRegularFile)
                                       .collect(Collectors.toList());

            for (Path filePath : filePaths) {
                try {
                    FileInfo fileInfo = createFileInfo(filePath);
                    allFiles.add(fileInfo);
                } catch (IOException e) {
                    logger.warn("Failed to process file: {}", filePath, e);
                }
            }
        }

        // Detect duplicates
        Map<String, List<FileInfo>> duplicateGroups = findDuplicates(allFiles);
        
        // Categorize files
        List<FileInfo> categorizedFiles = categoryService.categorizeFiles(allFiles);
        Map<String, List<FileInfo>> categorizedGroups = categorizedFiles.stream()
                .collect(Collectors.groupingBy(FileInfo::getCategory));

        // Create scan result
        ScanResult scanResult = new ScanResult(scanId, directory, LocalDateTime.now());
        scanResult.setFiles(categorizedFiles);
        scanResult.setDuplicateGroups(duplicateGroups);
        scanResult.setCategorizedFiles(categorizedGroups);
        scanResult.setTotalFiles(allFiles.size());
        scanResult.setDuplicateCount(duplicateGroups.values().stream()
                .mapToInt(group -> group.size() - 1)
                .sum());

        return scanResult;
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

    private Map<String, List<FileInfo>> findDuplicates(List<FileInfo> files) {
        Map<String, List<FileInfo>> hashGroups = files.stream()
                .collect(Collectors.groupingBy(FileInfo::getHash));

        // Mark duplicates and return groups with more than one file
        Map<String, List<FileInfo>> duplicateGroups = new HashMap<>();
        
        for (Map.Entry<String, List<FileInfo>> entry : hashGroups.entrySet()) {
            List<FileInfo> group = entry.getValue();
            if (group.size() > 1) {
                group.forEach(file -> file.setDuplicate(true));
                duplicateGroups.put(entry.getKey(), group);
            }
        }

        return duplicateGroups;
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