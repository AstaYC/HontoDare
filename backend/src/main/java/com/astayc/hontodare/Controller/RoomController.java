package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.RoomDTO;
import com.astayc.hontodare.Entity.Room;
import com.astayc.hontodare.Service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public List<RoomDTO> getAllRooms() {
        return roomService.getAllRooms();
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO roomDTO) {
        RoomDTO createdRoomDTO = roomService.createRoom(roomDTO);
        return ResponseEntity.ok(createdRoomDTO);
    }

    @GetMapping("/category/{category}")
    public List<RoomDTO> getRoomsByCategory(@PathVariable String category) {
        return roomService.getRoomsByCategory(category);
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<RoomDTO> updateRoom(@RequestBody RoomDTO roomDTO) {
        RoomDTO updatedRoomDTO = roomService.updateRoom(roomDTO);
        return ResponseEntity.ok(updatedRoomDTO);
    }
}