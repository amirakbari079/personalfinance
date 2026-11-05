package com.personalfinance.foundation;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.util.UUID;

@Aspect @Component @Order(1)
public class AuditTransactionAspect {
    private final JdbcTemplate jdbc;
    public AuditTransactionAspect(JdbcTemplate jdbc) { this.jdbc=jdbc; }

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    public Object context(ProceedingJoinPoint invocation) throws Throwable {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            var auth=SecurityContextHolder.getContext().getAuthentication();
            String actor=auth!=null && auth.isAuthenticated() ? auth.getName() : "system";
            var attrs=RequestContextHolder.getRequestAttributes();
            String requestId=UUID.randomUUID().toString();
            if(attrs instanceof ServletRequestAttributes request) {
                Object existing=request.getRequest().getAttribute("pf.requestId");
                if(existing==null) request.getRequest().setAttribute("pf.requestId",requestId);
                else requestId=existing.toString();
                if(request.getResponse()!=null) request.getResponse().setHeader("X-Request-ID",requestId);
            }
            jdbc.queryForObject("SELECT set_config('pf.actor',?,true)",String.class,actor);
            jdbc.queryForObject("SELECT set_config('pf.source',?,true)",String.class,attrs==null?"system":"user");
            jdbc.queryForObject("SELECT set_config('pf.request_id',?,true)",String.class,requestId);
        }
        return invocation.proceed();
    }
}
