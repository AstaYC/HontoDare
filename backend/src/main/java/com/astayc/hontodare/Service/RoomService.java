package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.RoomDTO;

import java.util.List;
import java.util.UUID;

public interface RoomService {
    List<RoomDTO> getAllRooms();
    RoomDTO createRoom(RoomDTO roomDTO);
    List<RoomDTO> getRoomsByCategory(String category);
    void deleteRoom(UUID roomId);
    RoomDTO updateRoom(RoomDTO roomDTO);
}