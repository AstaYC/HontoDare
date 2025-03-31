package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Exception.InvalidCredentialsException;
import com.astayc.hontodare.Exception.UserAlreadyExistsException;

import java.util.List;
import java.util.UUID;

public interface UserService {
    void register(RegisterDTO registerDTO) throws UserAlreadyExistsException;
    String login(LoginDTO loginDTO) throws InvalidCredentialsException;
    UserDTO getUserDTOById(Long id);

    List<UserDTO> getAllUsers();
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);

}

