package com.astayc.hontodare.Entity;

import com.astayc.hontodare.Entity.Enum.GameMode;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "game")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Timestamp startTime;

    @Column(nullable = true)
    private Timestamp endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GameMode gameMode;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne
    @JoinColumn(name = "player1_id", nullable = false)
    private User player1;

    @ManyToOne
    @JoinColumn(name = "player2_id", nullable = false)
    private User player2;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @ManyToOne
    @JoinColumn(name = "character1_id", nullable = false)
    private Character character1;

    @ManyToOne
    @JoinColumn(name = "character2_id", nullable = false)
    private Character character2;
}