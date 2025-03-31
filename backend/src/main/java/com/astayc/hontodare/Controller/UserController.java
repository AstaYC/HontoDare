package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Entity.Enum.Role;
import com.astayc.hontodare.Entity.User;
import com.astayc.hontodare.Repository.UserRepository;
import com.astayc.hontodare.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:4200")

public class UserController {
    @Autowired
    private  UserService userService;
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private  PasswordEncoder passwordEncoder;
    @Autowired
    private  ModelMapper modelMapper;


    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserDTOById(id));
    }


    @PutMapping(value = "/{id}", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestParam(value = "avatar", required = false) MultipartFile file,
            @RequestParam(value = "userData", required = false) String userDataJson,
            @RequestBody(required = false) UserDTO userDTORequest) {
        try {
            UserDTO userDTO;
            String password = null;

            // Handle multipart form data case (with potential file)
            if (userDataJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> dataMap = mapper.readValue(userDataJson, Map.class);
                userDTO = mapper.convertValue(dataMap, UserDTO.class);

                // Check if password included in form data
                if (dataMap.containsKey("password") && dataMap.get("password") != null
                        && !dataMap.get("password").toString().isEmpty()) {
                    password = dataMap.get("password").toString();
                }

                // Process file if provided
                if (file != null && !file.isEmpty()) {
                    try {
                        // Generate unique filename
                        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                        // Set path to frontend/src/assets/userPic
                        Path uploadPath = Paths.get("frontend/src/assets/userPic");
                        if (!Files.exists(uploadPath)) {
                            Files.createDirectories(uploadPath);
                        }

                        // Save file
                        Files.write(uploadPath.resolve(fileName), file.getBytes());

                        // Set avatarUrl in userDTO
                        userDTO.setAvatarUrl("/assets/userPic/" + fileName);
                    } catch (Exception e) {
                        System.err.println("Error saving file: " + e.getMessage());
                        // Continue without updating the avatar
                    }
                }
            }
            // Handle JSON request body case (no file)
            else if (userDTORequest != null) {
                userDTO = userDTORequest;

                // Extract password if included in JSON body
                Map<String, Object> requestMap = new ObjectMapper().convertValue(userDTORequest, Map.class);
                if (requestMap.containsKey("password") && requestMap.get("password") != null
                        && !requestMap.get("password").toString().isEmpty()) {
                    password = requestMap.get("password").toString();
                }
            } else {
                return ResponseEntity.badRequest().build();
            }

            // Get existing user to update
            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

            // Update fields
            if (userDTO.getUsername() != null) existingUser.setUsername(userDTO.getUsername());
            if (userDTO.getEmail() != null) existingUser.setEmail(userDTO.getEmail());
            if (userDTO.getName() != null) existingUser.setName(userDTO.getName());
            if (userDTO.getPoints() >= 0) existingUser.setPoints(userDTO.getPoints());

            // Update avatar if provided
            if (userDTO.getAvatarUrl() != null) {
                existingUser.setAvatarUrl(userDTO.getAvatarUrl());
            }

            // Update role if provided (admin only)
            if (userDTO.getRole() != null) {
                existingUser.setRole(Role.valueOf(userDTO.getRole()));
            }

            // Update password if provided
            if (password != null) {
                existingUser.setPassword(passwordEncoder.encode(password));
            }

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(modelMapper.map(updatedUser, UserDTO.class));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}