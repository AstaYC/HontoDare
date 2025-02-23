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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID roomId;

    @Column(nullable = false)
    private UUID player1Id;

    @Column(nullable = false)
    private UUID player2Id;

    @Column(nullable = false)
    private UUID character1Id;

    @Column(nullable = false)
    private UUID character2Id;

    @Column(nullable = false)
    private Timestamp startTime;

    @Column(nullable = true)
    private Timestamp endTime;

    @Column(nullable = true)
    private UUID winnerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GameMode gameMode;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "roomId")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "player1Id")
    private User player1;

    @ManyToOne
    @JoinColumn(name = "player2Id")
    private User player2;

    @ManyToOne
    @JoinColumn(name = "winnerId")
    private User winner;

    @ManyToOne
    @JoinColumn(name = "character1Id")
    private Character character1;

    @ManyToOne
    @JoinColumn(name = "character2Id")
    private Character character2;
}