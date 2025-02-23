package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Entity.Waiting;
import java.util.List;
import java.util.UUID;

public interface WaitingService {
    void joinRoom(UUID roomId, UUID userId);
    void leaveRoom(UUID roomId, UUID userId);
    List<WaitingDTO> getRoomUsers(UUID roomId);
}