package com.it342.voxa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VoxaApplication {
    public static void main(String[] args) {
        SpringApplication.run(VoxaApplication.class, args);
    }
}
