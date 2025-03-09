package com.astayc.hontodare.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitingDTO {
    private Long id;
    private Long roomId;
    private Long userId;
    private java.sql.Timestamp joinedAt;
}