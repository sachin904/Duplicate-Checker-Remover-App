package com.duplicateremover.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ScanResult {
    private String scanId;
    private String directory;
    private LocalDateTime scanTime;
    private List<FileInfo> files;
    private Map<String, List<FileInfo>> duplicateGroups;
    private Map<String, List<FileInfo>> categorizedFiles;
    private int totalFiles;
    private int duplicateCount;
    private String status;

    public ScanResult() {}

    public ScanResult(String scanId, String directory, LocalDateTime scanTime) {
        this.scanId = scanId;
        this.directory = directory;
        this.scanTime = scanTime;
        this.status = "COMPLETED";
    }

    // Getters and Setters
    public String getScanId() { return scanId; }
    public void setScanId(String scanId) { this.scanId = scanId; }

    public String getDirectory() { return directory; }
    public void setDirectory(String directory) { this.directory = directory; }

    public LocalDateTime getScanTime() { return scanTime; }
    public void setScanTime(LocalDateTime scanTime) { this.scanTime = scanTime; }

    public List<FileInfo> getFiles() { return files; }
    public void setFiles(List<FileInfo> files) { this.files = files; }

    public Map<String, List<FileInfo>> getDuplicateGroups() { return duplicateGroups; }
    public void setDuplicateGroups(Map<String, List<FileInfo>> duplicateGroups) { this.duplicateGroups = duplicateGroups; }

    public Map<String, List<FileInfo>> getCategorizedFiles() { return categorizedFiles; }
    public void setCategorizedFiles(Map<String, List<FileInfo>> categorizedFiles) { this.categorizedFiles = categorizedFiles; }

    public int getTotalFiles() { return totalFiles; }
    public void setTotalFiles(int totalFiles) { this.totalFiles = totalFiles; }

    public int getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}