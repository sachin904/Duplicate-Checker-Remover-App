package com.duplicateremover.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.hwpf.HWPFDocument;
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
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.StringReader;

@Service
public class FileHashService {

    private static final Logger logger = LoggerFactory.getLogger(FileHashService.class);

    public String generateSHA256Hash(String filePath) throws IOException {
        // First detect file type
        String fileType = detectFileTypeFromContent(filePath);
        
        // For all file types, try to extract text content for cross-format comparison
        String contentHash = generateUniversalContentHash(filePath, fileType);
        if (contentHash != null) {
            logger.debug("Using universal content hashing for file: {} (type: {})", filePath, fileType);
            return contentHash;
        }
        
        // Fallback to standard hashing for files that don't support text extraction
        logger.debug("Using standard hashing for file: {} (type: {})", filePath, fileType);
        try (FileInputStream fis = new FileInputStream(filePath)) {
            return DigestUtils.sha256Hex(fis);
        }
    }

    /**
     * Generates a universal content hash that can be compared across different file formats
     */
    private String generateUniversalContentHash(String filePath, String fileType) throws IOException {
        try {
            String extractedText = extractTextContent(filePath, fileType);
            if (extractedText != null && !extractedText.trim().isEmpty()) {
                // Normalize text content (remove extra whitespace, normalize line endings)
                String normalizedText = normalizeText(extractedText);
                String hash = DigestUtils.sha256Hex(normalizedText.getBytes("UTF-8"));
                
                logger.debug("Successfully extracted text from {} (type: {}). Text length: {}, Hash: {}", 
                           filePath, fileType, normalizedText.length(), hash.substring(0, 8) + "...");
                
                return hash;
            } else {
                logger.debug("No text content extracted from {} (type: {}), falling back to standard hash", 
                           filePath, fileType);
            }
        } catch (Exception e) {
            logger.warn("Failed to extract text content from file: {}", filePath, e);
        }
        return null;
    }

    /**
     * Extracts text content from any supported file type
     */
    private String extractTextContent(String filePath, String fileType) throws IOException {
        switch (fileType) {
            case "Documents":
                return extractDocumentText(filePath);
            case "Images":
                return extractImageText(filePath);
            case "Applications":
                return extractApplicationText(filePath);
            case "Archives":
                return extractArchiveText(filePath);
            case "Audio":
                return extractAudioText(filePath);
            case "Videos":
                return extractVideoText(filePath);
            default:
                return extractGenericText(filePath);
        }
    }

    /**
     * Extracts text from document files (PDF, DOCX, DOC, etc.)
     */
    private String extractDocumentText(String filePath) throws IOException {
        // Check if it's a PDF
        if (isPDF(filePath)) {
            return extractPDFText(filePath);
        }
        // Check if it's a DOCX
        else if (isDOCX(filePath)) {
            return extractDOCXText(filePath);
        }
        // Check if it's a DOC
        else if (isDOC(filePath)) {
            return extractDOCText(filePath);
        }
        // Try generic text extraction
        else {
            return extractGenericText(filePath);
        }
    }

    /**
     * Extracts text from PDF files
     */
    private String extractPDFText(String filePath) throws IOException {
        try (PDDocument document = PDDocument.load(new java.io.File(filePath))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            logger.warn("Failed to extract PDF text: {}", filePath, e);
            return null;
        }
    }

    /**
     * Extracts text from DOCX files
     */
    private String extractDOCXText(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            StringBuilder content = new StringBuilder();
            
            // Extract text from paragraphs
            document.getParagraphs().forEach(paragraph -> {
                content.append(paragraph.getText()).append("\n");
            });
            
            // Extract text from tables
            document.getTables().forEach(table -> {
                table.getRows().forEach(row -> {
                    row.getTableCells().forEach(cell -> {
                        content.append(cell.getText()).append("\t");
                    });
                    content.append("\n");
                });
            });
            
            return content.toString();
            
        } catch (Exception e) {
            logger.warn("Failed to extract DOCX text: {}", filePath, e);
            return null;
        }
    }

    /**
     * Extracts text from DOC files
     */
    private String extractDOCText(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             HWPFDocument document = new HWPFDocument(fis)) {
            
            return document.getRange().text();
            
        } catch (Exception e) {
            logger.warn("Failed to extract DOC text: {}", filePath, e);
            return null;
        }
    }

    /**
     * Extracts text from image files (OCR would be needed for full implementation)
     */
    private String extractImageText(String filePath) throws IOException {
        // For now, return null as OCR is not implemented
        // In a production system, you would integrate with Tesseract or similar OCR
        logger.debug("Image text extraction not implemented for: {}", filePath);
        return null;
    }

    /**
     * Extracts text from application files
     */
    private String extractApplicationText(String filePath) throws IOException {
        // For executable files, we can't extract meaningful text content
        logger.debug("Application text extraction not applicable for: {}", filePath);
        return null;
    }

    /**
     * Extracts text from archive files
     */
    private String extractArchiveText(String filePath) throws IOException {
        // For archive files, we could extract text from contained files
        // For now, return null as this is complex
        logger.debug("Archive text extraction not implemented for: {}", filePath);
        return null;
    }

    /**
     * Extracts text from audio files
     */
    private String extractAudioText(String filePath) throws IOException {
        // For audio files, speech-to-text would be needed
        logger.debug("Audio text extraction not implemented for: {}", filePath);
        return null;
    }

    /**
     * Extracts text from video files
     */
    private String extractVideoText(String filePath) throws IOException {
        // For video files, speech-to-text and OCR would be needed
        logger.debug("Video text extraction not implemented for: {}", filePath);
        return null;
    }

    /**
     * Generic text extraction for unknown file types
     */
    private String extractGenericText(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath)) {
            byte[] buffer = new byte[8192];
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int bytesRead;
            
            while ((bytesRead = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
            
            byte[] content = baos.toByteArray();
            
            // Check if content is mostly text
            if (isTextContent(content)) {
                return new String(content, "UTF-8");
            }
            
            return null;
        }
    }

    /**
     * Checks if byte array contains mostly text content
     */
    private boolean isTextContent(byte[] content) {
        int textBytes = 0;
        int totalBytes = Math.min(content.length, 1024); // Check first 1KB
        
        for (int i = 0; i < totalBytes; i++) {
            byte b = content[i];
            // Check for printable ASCII characters and common whitespace
            if ((b >= 32 && b <= 126) || b == 9 || b == 10 || b == 13) {
                textBytes++;
            } else if (b == 0) {
                // Null bytes suggest binary content
                return false;
            }
        }
        
        // If more than 90% are printable characters, consider it text
        return totalBytes > 0 && (textBytes * 100 / totalBytes) > 90;
    }

    /**
     * Normalizes text content for consistent comparison
     */
    private String normalizeText(String text) {
        if (text == null) return "";
        
        return text
            .replaceAll("\\s+", " ")  // Replace multiple whitespace with single space
            .replaceAll("\\n\\s*\\n", "\n")  // Remove empty lines
            .trim()  // Remove leading/trailing whitespace
            .toLowerCase();  // Convert to lowercase for case-insensitive comparison
    }

    /**
     * Checks if file is a PDF
     */
    private boolean isPDF(String filePath) throws IOException {
        try (RandomAccessFile file = new RandomAccessFile(filePath, "r")) {
            if (file.length() < 4) return false;
            byte[] header = new byte[4];
            file.read(header);
            return header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46;
        }
    }

    /**
     * Checks if file is a DOCX
     */
    private boolean isDOCX(String filePath) throws IOException {
        try (RandomAccessFile file = new RandomAccessFile(filePath, "r")) {
            if (file.length() < 4) return false;
            byte[] header = new byte[4];
            file.read(header);
            return header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04;
        }
    }

    /**
     * Checks if file is a DOC
     */
    private boolean isDOC(String filePath) throws IOException {
        try (RandomAccessFile file = new RandomAccessFile(filePath, "r")) {
            if (file.length() < 4) return false;
            byte[] header = new byte[4];
            file.read(header);
            return (header[0] & 0xFF) == 0xD0 && (header[1] & 0xFF) == 0xCF && header[2] == 0x11 && (header[3] & 0xFF) == 0xE0;
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
