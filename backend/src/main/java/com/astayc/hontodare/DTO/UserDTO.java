package com.astayc.hontodare.DTO;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private UUID id;
    private String username;
    private String name;
    private String email;
    private String avatarUrl;
    private int points;
    private String role;

}