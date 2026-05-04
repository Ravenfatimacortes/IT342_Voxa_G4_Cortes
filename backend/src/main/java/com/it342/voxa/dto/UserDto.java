package com.it342.voxa.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String studentId;
    private String department;
    private String profileImageUrl;
    private Boolean emailVerified;
    private String token;
    private LocalDateTime createdAt;
}
