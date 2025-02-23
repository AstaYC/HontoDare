package com.astayc.hontodare.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitingDTO {
    private UUID roomId;
    private UUID userId;
    private java.sql.Timestamp joinedAt;
}