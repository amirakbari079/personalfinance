package com.personalfinance.backup;

import com.personalfinance.backup.dto.BackupFileResponse;
import com.personalfinance.backup.dto.BackupListResponse;
import com.personalfinance.backup.dto.RestoreResultResponse;
import com.personalfinance.common.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/backups")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BackupListResponse>> list() {
        return ResponseEntity.ok(ApiResponse.ok(
                BackupListResponse.of(backupService.backupDir().toString(), backupService.list())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BackupFileResponse>> create() {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("بکاپ ذخیره شد", backupService.create()));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BackupFileResponse>> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("فایل بکاپ اضافه شد", backupService.upload(file)));
    }

    @PostMapping("/restore")
    public ResponseEntity<ApiResponse<RestoreResultResponse>> restore(@RequestParam("name") String name) {
        return ResponseEntity.ok(ApiResponse.ok("بازیابی با موفقیت انجام شد", backupService.restore(name)));
    }

    @DeleteMapping("/file")
    public ResponseEntity<ApiResponse<Void>> delete(@RequestParam("name") String name) {
        backupService.delete(name);
        return ResponseEntity.ok(ApiResponse.ok("فایل بکاپ حذف شد", null));
    }

    @GetMapping("/file")
    public void download(@RequestParam("name") String name, HttpServletResponse response) throws IOException {
        Path file = backupService.fileForDownload(name);
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + file.getFileName() + "\"");
        Files.copy(file, response.getOutputStream());
        response.getOutputStream().flush();
    }
}
