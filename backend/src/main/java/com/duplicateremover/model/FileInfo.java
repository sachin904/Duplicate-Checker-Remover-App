package com.duplicateremover.model;

import java.time.LocalDateTime;
import java.util.Objects;

public class FileInfo {
    private String filePath;
    private String fileName;
    private String hash;
    private long size;
    private String extension;
    private String category;
    private LocalDateTime lastModified;
    private boolean isDuplicate;

    public FileInfo() {}

    public FileInfo(String filePath, String fileName, String hash, long size, String extension, LocalDateTime lastModified) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.hash = hash;
        this.size = size;
        this.extension = extension;
        this.lastModified = lastModified;
        this.isDuplicate = false;
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

    public String getExtension() { return extension; }
    public void setExtension(String extension) { this.extension = extension; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }

    public boolean isDuplicate() { return isDuplicate; }
    public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FileInfo fileInfo = (FileInfo) o;
        return Objects.equals(hash, fileInfo.hash);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hash);
    }
}