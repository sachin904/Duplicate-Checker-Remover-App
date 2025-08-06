package com.duplicateremover.controller;

import com.duplicateremover.model.ScanResult;
import com.duplicateremover.model.FileInfo;
import com.duplicateremover.service.FileScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class FileScanController {

    private static final Logger logger = LoggerFactory.getLogger(FileScanController.class);

    @Autowired
    private FileScanService fileScanService;

    @PostMapping("/scan")
    public ResponseEntity<?> startScan(@RequestBody Map<String, String> request) {
        try {
            String directory = request.get("directory");
            if (directory == null || directory.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Directory path is required");
            }

            String scanId = fileScanService.startScan(directory);
            return ResponseEntity.ok(Map.of("scanId", scanId, "status", "STARTED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/scan/{scanId}")
    public ResponseEntity<?> getScanResult(@PathVariable String scanId) {
        ScanResult result = fileScanService.getScanResult(scanId);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/scan/{scanId}/progress")
    public ResponseEntity<?> getScanProgress(@PathVariable String scanId) {
        Map<String, Object> progress = fileScanService.getScanProgress(scanId);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/scan/{scanId}/duplicates/stream")
    public ResponseEntity<?> getDuplicateStream(@PathVariable String scanId) {
        List<FileInfo> duplicates = fileScanService.getCurrentDuplicates(scanId);
        if (duplicates == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
            "scanId", scanId,
            "duplicates", duplicates,
            "count", duplicates.size(),
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/scans")
    public ResponseEntity<List<ScanResult>> getAllScans() {
        List<ScanResult> results = fileScanService.getAllScanResults();
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/duplicates/{scanId}")
    public ResponseEntity<?> permanentlyDeleteFiles(
            @PathVariable String scanId,
            @RequestBody Map<String, List<String>> request) {
        
        List<String> filePaths = request.get("filePaths");
        if (filePaths == null || filePaths.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No file paths provided",
                "success", false
            ));
        }

        try {
            boolean success = fileScanService.deleteDuplicateFiles(scanId, filePaths);
            return ResponseEntity.ok(Map.of(
                "success", success,
                "deletedCount", filePaths.size(),
                "scanId", scanId,
                "message", "Files permanently deleted",
                "warning", "This action cannot be undone"
            ));
        } catch (Exception e) {
            logger.error("Error permanently deleting files for scanId: {}", scanId, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to permanently delete files: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @DeleteMapping("/directories/{scanId}")
    public ResponseEntity<?> permanentlyDeleteDirectories(
            @PathVariable String scanId,
            @RequestBody Map<String, List<String>> request) {
        
        List<String> directoryPaths = request.get("directoryPaths");
        if (directoryPaths == null || directoryPaths.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "No directory paths provided",
                "success", false
            ));
        }

        try {
            boolean success = fileScanService.deleteDirectories(scanId, directoryPaths);
            return ResponseEntity.ok(Map.of(
                "success", success,
                "deletedCount", directoryPaths.size(),
                "scanId", scanId,
                "message", "Directories permanently deleted",
                "warning", "This action cannot be undone"
            ));
        } catch (Exception e) {
            logger.error("Error permanently deleting directories for scanId: {}", scanId, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to permanently delete directories: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/test-file-operation")
    public ResponseEntity<?> testFileOperation() {
        try {
            // Test if we can create and delete a temporary file
            File tempFile = File.createTempFile("test", ".tmp");
            boolean created = tempFile.exists();
            boolean deleted = tempFile.delete();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "canCreateFiles", created,
                "canDeleteFiles", deleted,
                "tempDir", System.getProperty("java.io.tmpdir")
            ));
        } catch (Exception e) {
            logger.error("File operation test failed", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}