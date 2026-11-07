package com.personalfinance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.transaction.annotation.EnableTransactionManagement(order = 0)
public class PersonalFinanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PersonalFinanceApplication.class, args);
    }
}
