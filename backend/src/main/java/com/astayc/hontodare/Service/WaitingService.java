package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Entity.Waiting;
import java.util.List;
import java.util.UUID;

public interface WaitingService {
    void joinRoom(Long roomId, Long userId);
    void leaveRoom(Long roomId, Long userId);
    List<WaitingDTO> getRoomUsers(Long roomId);
}