package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Entity.Enum.Role;
import com.astayc.hontodare.Entity.User;
import com.astayc.hontodare.Exception.HontoDareException;
import com.astayc.hontodare.Repository.UserRepository;
import com.astayc.hontodare.Service.UserService;
import com.astayc.hontodare.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;


    @Override
    public void register(RegisterDTO registerDTO) {
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new HontoDareException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new HontoDareException("Email is already registered!", HttpStatus.BAD_REQUEST);
        }

        User user = modelMapper.map(registerDTO, User.class);
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword())); // Encode password
        user.setRole(Role.USER);
        user.setPoints(0);

        userRepository.save(user);
    }

    @Override
    public String login(LoginDTO loginDTO) {
        String email = loginDTO.getEmail();
        String password = loginDTO.getPassword();

        // Find and authenticate user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new HontoDareException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new HontoDareException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Generate and return JWT token
        return jwtUtil.generateToken( user.getId(), user.getUsername() , user.getName() , user.getRole().toString());
    }

    @Override
    public UserDTO getUserDTOById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .toList();
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        // Check username and email uniqueness...

        // Update fields
        existingUser.setUsername(userDTO.getUsername());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setName(userDTO.getName());
        existingUser.setPoints(userDTO.getPoints());

        // Update avatar URL if provided
        if (userDTO.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(userDTO.getAvatarUrl());
        }

        // Admin can update roles
        if (userDTO.getRole() != null) {
            existingUser.setRole(Role.valueOf(userDTO.getRole()));
        }

        User updatedUser = userRepository.save(existingUser);
        return modelMapper.map(updatedUser, UserDTO.class);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UsernameNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

}
