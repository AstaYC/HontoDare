package com.astayc.hontodare.DTO;

import com.astayc.hontodare.Entity.Enum.GameMode;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {

    private UUID id;
    private UUID roomId;
    private UUID player1Id;
    private UUID player2Id;
    private UUID character1Id;
    private UUID character2Id;
    private java.sql.Timestamp startTime;
    private java.sql.Timestamp endTime;
    private UUID winnerId;
    private GameMode gameMode;
}