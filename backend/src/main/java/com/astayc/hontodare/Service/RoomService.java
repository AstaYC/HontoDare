package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.RoomDTO;

import java.util.List;

public interface RoomService {
    List<RoomDTO> getAllRooms();
    RoomDTO createRoom(RoomDTO roomDTO);
    List<RoomDTO> getRoomsByCategory(String category);
}