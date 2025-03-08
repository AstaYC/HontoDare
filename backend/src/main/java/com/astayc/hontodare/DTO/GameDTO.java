package com.astayc.hontodare.DTO;

import com.astayc.hontodare.Entity.Enum.GameMode;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {

    private Long id;
    private Long roomId;
    private Long player1Id;
    private Long player2Id;
    private Long character1Id;
    private Long character2Id;
    private java.sql.Timestamp startTime;
    private java.sql.Timestamp endTime;
    private Long winnerId;
    private GameMode gameMode;
}