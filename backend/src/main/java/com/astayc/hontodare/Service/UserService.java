package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.Auth.LoginDTO;
import com.astayc.hontodare.DTO.Auth.RegisterDTO;
import com.astayc.hontodare.Exception.InvalidCredentialsException;
import com.astayc.hontodare.Exception.UserAlreadyExistsException;

public interface UserService {
    void register(RegisterDTO registerDTO) throws UserAlreadyExistsException;
    String login(LoginDTO loginDTO) throws InvalidCredentialsException;
}

