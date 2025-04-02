package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Entity.Enum.Role;
import com.astayc.hontodare.Entity.User;
import com.astayc.hontodare.Repository.UserRepository;
import com.astayc.hontodare.Service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ModelMapper modelMapper;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserDTOById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDTO> updateUserJson(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        try {
            String password = null;
            Map<String, Object> requestMap = new ObjectMapper().convertValue(userDTO, Map.class);
            if (requestMap.containsKey("password") && requestMap.get("password") != null
                    && !requestMap.get("password").toString().isEmpty()) {
                password = requestMap.get("password").toString();
            }

            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

            if (userDTO.getUsername() != null) existingUser.setUsername(userDTO.getUsername());
            if (userDTO.getEmail() != null) existingUser.setEmail(userDTO.getEmail());
            if (userDTO.getName() != null) existingUser.setName(userDTO.getName());
            if (userDTO.getPoints() >= 0) existingUser.setPoints(userDTO.getPoints());

            if (userDTO.getAvatarUrl() != null) {
                existingUser.setAvatarUrl(userDTO.getAvatarUrl());
            }

            if (userDTO.getRole() != null) {
                existingUser.setRole(Role.valueOf(userDTO.getRole()));
            }

            if (password != null) {
                existingUser.setPassword(passwordEncoder.encode(password));
            }

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(modelMapper.map(updatedUser, UserDTO.class));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> updateUserMultipart(
            @PathVariable Long id,
            @RequestParam(value = "avatar", required = false) MultipartFile file,
            @RequestParam(value = "userData", required = false) String userDataJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> dataMap = mapper.readValue(userDataJson, Map.class);
            UserDTO userDTO = mapper.convertValue(dataMap, UserDTO.class);

            String password = null;
            if (dataMap.containsKey("password") && dataMap.get("password") != null
                    && !dataMap.get("password").toString().isEmpty()) {
                password = dataMap.get("password").toString();
            }

            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

            if (userDTO.getUsername() != null) existingUser.setUsername(userDTO.getUsername());
            if (userDTO.getEmail() != null) existingUser.setEmail(userDTO.getEmail());
            if (userDTO.getName() != null) existingUser.setName(userDTO.getName());
            if (userDTO.getPoints() >= 0) existingUser.setPoints(userDTO.getPoints());

            if (userDTO.getRole() != null) {
                existingUser.setRole(Role.valueOf(userDTO.getRole()));
            }

            if (password != null) {
                existingUser.setPassword(passwordEncoder.encode(password));
            }

            if (file != null && !file.isEmpty()) {
                try {
                    String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                    String uploadDir = "uploads/userPic";
                    Path uploadPath = Paths.get(uploadDir);

                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, file.getBytes());

                    existingUser.setAvatarUrl("/api/images/userPic/" + fileName);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("Error saving file: " + e.getMessage());
                }
            }

            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(modelMapper.map(updatedUser, UserDTO.class));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}