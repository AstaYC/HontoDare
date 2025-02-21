package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.Entity.Enum.Role;
import com.astayc.hontodare.Entity.User;
import com.astayc.hontodare.Exception.HontoDareException;
import com.astayc.hontodare.Repository.UserRepository;
import com.astayc.hontodare.Service.UserService;
import com.astayc.hontodare.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public void register(RegisterDTO registerDTO) {
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new HontoDareException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new HontoDareException("Email is already registered!", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .username(registerDTO.getUsername())
                .name(registerDTO.getName())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(Role.USER)
                .points(0)
                .build();

        userRepository.save(user);
    }

    @Override
    public String login(LoginDTO loginDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
        );

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        return jwtUtil.generateToken(user.getId() , user.getRole().toString());
    }
}
