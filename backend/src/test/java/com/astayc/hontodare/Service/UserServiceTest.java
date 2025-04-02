package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Entity.Enum.Role;
import com.astayc.hontodare.Entity.User;
import com.astayc.hontodare.Exception.HontoDareException;
import com.astayc.hontodare.Repository.UserRepository;
import com.astayc.hontodare.Service.Impl.UserServiceImpl;
import com.astayc.hontodare.Util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Create test data
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("hashedPassword")
                .name("Test User")
                .points(100)
                .role(Role.USER)
                .avatarUrl("/assets/userPic/default.png")
                .build();

        testUserDTO = new UserDTO();
        testUserDTO.setId(1L);
        testUserDTO.setUsername("testuser");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setName("Test User");
        testUserDTO.setPoints(100);
        testUserDTO.setRole("USER");
        testUserDTO.setAvatarUrl("/assets/userPic/default.png");

        when(modelMapper.map(any(User.class), eq(UserDTO.class))).thenReturn(testUserDTO);
        when(modelMapper.map(any(UserDTO.class), eq(User.class))).thenReturn(testUser);
    }

    @Test
    void getUserDTOById_WithValidId_ShouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));


        UserDTO result = userService.getUserDTOById(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserDTOById_WithInvalidId_ShouldThrowException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.getUserDTOById(99L));
        verify(userRepository).findById(99L);
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));

        List<UserDTO> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
    }

    @Test
    void register_WithValidData_ShouldCreateUser() {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("newuser");
        registerDTO.setEmail("new@example.com");
        registerDTO.setPassword("password");
        registerDTO.setName("New User");

        User newUser = new User();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(modelMapper.map(any(RegisterDTO.class), eq(User.class))).thenReturn(newUser); // Mock this specifically

        userService.register(registerDTO);

        verify(passwordEncoder).encode("password");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WithExistingUsername_ShouldThrowException() {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("testuser");
        registerDTO.setEmail("new@example.com");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        HontoDareException exception = assertThrows(HontoDareException.class,
                () -> userService.register(registerDTO));
        assertEquals("Username is already taken!", exception.getMessage());
    }

    @Test
    void login_WithValidCredentials_ShouldReturnToken() {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(eq(1L), eq("testuser"), eq("Test User"), eq("USER"))).thenReturn("test-jwt-token");

        String token = userService.login(loginDTO);

        assertNotNull(token);
        assertEquals("test-jwt-token", token);
    }

    @Test
    void updateUser_WithValidData_ShouldReturnUpdatedUser() {
        UserDTO updateDTO = new UserDTO();
        updateDTO.setUsername("updateduser");
        updateDTO.setEmail("updated@example.com");
        updateDTO.setName("Updated User");
        updateDTO.setPoints(200);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDTO result = userService.updateUser(1L, updateDTO);

        assertNotNull(result);
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deleteUser_WithValidId_ShouldDeleteUser() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_WithInvalidId_ShouldThrowException() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThrows(UsernameNotFoundException.class, () -> userService.deleteUser(99L));
    }
}