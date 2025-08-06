package com.duplicateremover.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class FileInfo {
    private String filePath;
    private String fileName;
    private String hash;
    private long size;
    private String category;
    private LocalDateTime createdTime; // Keep creation time for sorting/display purposes
    private boolean isDuplicate;
    private boolean markedForDeletion;

    public FileInfo() {}

    public FileInfo(String filePath, String fileName, String hash, long size) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.hash = hash;
        this.size = size;
        this.createdTime = LocalDateTime.now();
        this.isDuplicate = false;
        this.markedForDeletion = false;
    }

    public FileInfo(String filePath, String fileName, String hash, long size, LocalDateTime createdTime) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.hash = hash;
        this.size = size;
        this.createdTime = createdTime;
        this.isDuplicate = false;
        this.markedForDeletion = false;
    }

    // Getters and Setters
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }

    public boolean isDuplicate() { return isDuplicate; }
    public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }

    public boolean isMarkedForDeletion() { return markedForDeletion; }
    public void setMarkedForDeletion(boolean markedForDeletion) { this.markedForDeletion = markedForDeletion; }

    /**
     * Extract extension from filename for backward compatibility
     * Note: This is only for display purposes, not for categorization
     */
    public String getExtension() {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : "";
    }

    /**
     * Get last modified time for backward compatibility
     * Note: This is only for display purposes, not for duplicate detection
     */
    public LocalDateTime getLastModified() {
        return createdTime; // Use creation time as fallback
    }

    /**
     * Checks if two files are duplicates based solely on content (hash)
     * Size is also compared for additional verification
     */
    public boolean isContentDuplicate(FileInfo other) {
        if (other == null) return false;
        if (this == other) return false; // Same object, not a duplicate
        
        // Primary check: content hash must match
        if (!Objects.equals(this.hash, other.hash)) {
            return false;
        }
        
        // Secondary check: file size must match
        if (this.size != other.size) {
            return false;
        }
        
        // Files are duplicates based on content
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FileInfo fileInfo = (FileInfo) o;
        
        // Equality based on content hash and size only
        return size == fileInfo.size && Objects.equals(hash, fileInfo.hash);
    }

    @Override
    public int hashCode() {
        // Hash code based on content hash and size only
        return Objects.hash(hash, size);
    }

    @Override
    public String toString() {
        return String.format("FileInfo{fileName='%s', hash='%s', size=%d, category='%s', isDuplicate=%s}",
                fileName, hash != null ? hash.substring(0, Math.min(8, hash.length())) + "..." : "null", 
                size, category, isDuplicate);
    }
}
