package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.DTO.UserDTO;
import com.astayc.hontodare.Exception.InvalidCredentialsException;
import com.astayc.hontodare.Exception.UserAlreadyExistsException;

import java.util.UUID;

public interface UserService {
    void register(RegisterDTO registerDTO) throws UserAlreadyExistsException;
    String login(LoginDTO loginDTO) throws InvalidCredentialsException;
    UserDTO getUserDTOById(UUID id);

}

