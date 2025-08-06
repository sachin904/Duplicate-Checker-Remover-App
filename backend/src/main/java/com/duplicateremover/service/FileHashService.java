package com.duplicateremover.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

@Service
public class FileHashService {

    private static final Logger logger = LoggerFactory.getLogger(FileHashService.class);

    public String generateSHA256Hash(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath)) {
            return DigestUtils.sha256Hex(fis);
        }
    }

    /**
     * Detects file type based on content (magic numbers) rather than extension
     */
    public String detectFileTypeFromContent(String filePath) {
        try (RandomAccessFile file = new RandomAccessFile(filePath, "r")) {
            if (file.length() < 4) {
                return "Unknown";
            }

            byte[] header = new byte[16]; // Read first 16 bytes for magic number detection
            int bytesRead = file.read(header);
            
            if (bytesRead < 4) {
                return "Unknown";
            }

            // Check common file signatures (magic numbers)
            return detectFileTypeByMagicNumber(header);

        } catch (IOException e) {
            logger.warn("Failed to read file header for type detection: {}", filePath, e);
            return "Unknown";
        }
    }

    private String detectFileTypeByMagicNumber(byte[] header) {
        // Images
        if (header.length >= 4) {
            // JPEG
            if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
                return "Images";
            }
            // PNG
            if ((header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
                return "Images";
            }
            // GIF
            if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46) {
                return "Images";
            }
            // BMP
            if (header[0] == 0x42 && header[1] == 0x4D) {
                return "Images";
            }
        }

        // Documents
        if (header.length >= 8) {
            // PDF
            if (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46) {
                return "Documents";
            }
            // MS Office (newer formats)
            if (header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04) {
                return "Documents";
            }
            // MS Office (older formats)
            if ((header[0] & 0xFF) == 0xD0 && (header[1] & 0xFF) == 0xCF && header[2] == 0x11 && (header[3] & 0xFF) == 0xE0) {
                return "Documents";
            }
        }

        // Archives
        if (header.length >= 4) {
            // ZIP
            if (header[0] == 0x50 && header[1] == 0x4B && (header[2] == 0x03 || header[2] == 0x05 || header[2] == 0x07)) {
                return "Archives";
            }
            // RAR
            if (header[0] == 0x52 && header[1] == 0x61 && header[2] == 0x72 && header[3] == 0x21) {
                return "Archives";
            }
            // 7Z
            if (header[0] == 0x37 && header[1] == 0x7A && header[2] == (byte)0xBC && header[3] == (byte)0xAF) {
                return "Archives";
            }
        }

        // Executables
        if (header.length >= 2) {
            // Windows PE
            if (header[0] == 0x4D && header[1] == 0x5A) {
                return "Applications";
            }
        }

        if (header.length >= 4) {
            // ELF (Linux executables)
            if (header[0] == 0x7F && header[1] == 0x45 && header[2] == 0x4C && header[3] == 0x46) {
                return "Applications";
            }
        }

        // Audio
        if (header.length >= 4) {
            // MP3
            if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xE0) == 0xE0) {
                return "Audio";
            }
            // WAV
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46) {
                return "Audio";
            }
            // FLAC
            if (header[0] == 0x66 && header[1] == 0x4C && header[2] == 0x61 && header[3] == 0x43) {
                return "Audio";
            }
        }

        // Video
        if (header.length >= 8) {
            // MP4
            if (header[4] == 0x66 && header[5] == 0x74 && header[6] == 0x79 && header[7] == 0x70) {
                return "Videos";
            }
            // AVI
            if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                header[8] == 0x41 && header[9] == 0x56 && header[10] == 0x49 && header[11] == 0x20) {
                return "Videos";
            }
        }

        // Text files (check for printable ASCII)
        if (isProbablyTextFile(header)) {
            return "Documents";
        }

        return "Others";
    }

    private boolean isProbablyTextFile(byte[] header) {
        int printableCount = 0;
        int totalBytes = Math.min(header.length, 512); // Check first 512 bytes
        
        for (int i = 0; i < totalBytes; i++) {
            byte b = header[i];
            // Check for printable ASCII characters and common whitespace
            if ((b >= 32 && b <= 126) || b == 9 || b == 10 || b == 13) {
                printableCount++;
            } else if (b == 0) {
                // Null bytes strongly suggest binary file
                return false;
            }
        }
        
        // If more than 95% are printable characters, likely text
        return totalBytes > 0 && (printableCount * 100 / totalBytes) > 95;
    }
}
