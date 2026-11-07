package com.personalfinance.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .filter(text -> text != null && !text.isBlank())
                .findFirst()
                .orElse("خطای اعتبارسنجی");
        return ResponseEntity.badRequest().body(ApiResponse.error(message));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoSuchElementException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "یافت نشد";
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "درخواست نامعتبر";
        return ResponseEntity.badRequest().body(ApiResponse.error(message));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(IllegalStateException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "وضعیت فعلی اجازه این عملیات را نمی‌دهد";
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("نام کاربری یا رمز عبور اشتباه است"));
    }

    @ExceptionHandler({org.springframework.dao.OptimisticLockingFailureException.class,
            jakarta.persistence.OptimisticLockException.class})
    public ResponseEntity<ApiResponse<Void>> handleVersionConflict(Exception ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("رکورد تغییر کرده است؛ دوباره بارگذاری کنید"));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(Exception ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("داده تکراری است یا با رکوردهای مرتبط سازگار نیست"));
    }

    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
            org.springframework.web.bind.MissingServletRequestParameterException.class})
    public ResponseEntity<ApiResponse<Void>> handleMalformed(Exception ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error("قالب درخواست یا یکی از فیلدهای الزامی معتبر نیست"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("خطای داخلی سرور"));
    }
}
