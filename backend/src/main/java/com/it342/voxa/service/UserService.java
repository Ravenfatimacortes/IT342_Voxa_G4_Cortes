package com.it342.voxa.service;

import com.it342.voxa.dto.UserDto;
import com.it342.voxa.dto.RegisterRequest;
import com.it342.voxa.dto.LoginRequest;
import com.it342.voxa.dto.AuthResponse;
import com.it342.voxa.entity.User;
import com.it342.voxa.repository.UserRepository;
import com.it342.voxa.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStudentId(request.getStudentId());
        user.setDepartment(request.getDepartment());

        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(convertToDto(savedUser))
                .build();
    }

    public AuthResponse authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = (User) authentication.getPrincipal();

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(convertToDto(user))
                .build();
    }

    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return convertToDto(user);
        }
        return null;
    }

    public UserDto authenticateGoogle(String googleId, String email, String firstName, String lastName) {
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    // Create new user if not exists
                    User newUser = new User();
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setEmail(email);
                    newUser.setGoogleId(googleId);
                    newUser.setRole(User.Role.STUDENT);
                    newUser.setEmailVerified(true);
                    return userRepository.save(newUser);
                });

        String jwtToken = jwtService.generateToken(user);

        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .token(jwtToken)
                .build();
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .profileImageUrl(user.getProfileImageUrl())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
