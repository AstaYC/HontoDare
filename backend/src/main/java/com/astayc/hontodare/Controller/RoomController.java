package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.RoomDTO;
import com.astayc.hontodare.Service.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:4200")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public List<RoomDTO> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/category/{category}")
    public List<RoomDTO> getRoomsByCategory(@PathVariable String category) {
        return roomService.getRoomsByCategory(category);
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<RoomDTO> createRoom(
            @RequestParam("roomData") String roomDataJson,
            @RequestParam(value = "roomPic", required = false) MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            RoomDTO roomDTO = mapper.readValue(roomDataJson, RoomDTO.class);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                Path uploadPath = Paths.get("frontend/src/assets/roomPic");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.write(uploadPath.resolve(fileName), file.getBytes());

                roomDTO.setRoomPicUrl("/assets/roomPic/" + fileName);
            }

            RoomDTO createdRoom = roomService.createRoom(roomDTO);
            return ResponseEntity.ok(createdRoom);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long id,
            @RequestParam("roomData") String roomDataJson,
            @RequestParam(value = "roomPic", required = false) MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            RoomDTO roomDTO = mapper.readValue(roomDataJson, RoomDTO.class);
            roomDTO.setId(id);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                Path uploadPath = Paths.get("frontend/src/assets/roomPic");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.write(uploadPath.resolve(fileName), file.getBytes());

                roomDTO.setRoomPicUrl("/assets/roomPic/" + fileName);
            }

            RoomDTO updatedRoom = roomService.updateRoom(roomDTO);
            return ResponseEntity.ok(updatedRoom);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }
}