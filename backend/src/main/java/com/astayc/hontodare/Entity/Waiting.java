package com.astayc.hontodare.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "waiting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Waiting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private Timestamp joinedAt = Timestamp.valueOf(LocalDateTime.now());

    public Waiting(Long roomId, Long userId) {
        this.roomId = roomId;
        this.userId = userId;
        this.joinedAt = Timestamp.valueOf(LocalDateTime.now());
    }

}