package com.astayc.hontodare.Entity;

import com.astayc.hontodare.Entity.Enum.Role;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    private int points;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}