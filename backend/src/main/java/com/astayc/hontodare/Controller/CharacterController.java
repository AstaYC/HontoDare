package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.CharacterDTO;
import com.astayc.hontodare.Entity.Room;
import com.astayc.hontodare.Entity.Waiting;
import com.astayc.hontodare.Repository.RoomRepository;
import com.astayc.hontodare.Repository.WaitingRepository;
import com.astayc.hontodare.Service.CharacterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/character")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private WaitingRepository waitingRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Track which players have uploaded in each room
    private Map<Long, Map<Long, Boolean>> roomUploads = new ConcurrentHashMap<>();

    @GetMapping
    public ResponseEntity<List<CharacterDTO>> getAllCharacters() {
        return ResponseEntity.ok(characterService.getAllCharacters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CharacterDTO> getCharacterById(@PathVariable Long id) {
        try {
            CharacterDTO character = characterService.getCharacterById(id);
            return ResponseEntity.ok(character);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createCharacterWithFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("character") String characterJson) {
        try {
            System.out.println("Character upload endpoint hit!");

            // Convert JSON string to CharacterDTO
            ObjectMapper mapper = new ObjectMapper();
            CharacterDTO characterDTO = mapper.readValue(characterJson, CharacterDTO.class);

            // Process file if provided
            if (file != null && !file.isEmpty()) {
                // Generate unique filename
                String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                // Create directory if it doesn't exist
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Save file
                Files.write(uploadPath.resolve(fileName), file.getBytes());

                // Set URL in character
                characterDTO.setPicUrl("/uploads/" + fileName);
            }

//             Save character
            CharacterDTO savedCharacter = characterService.createCharacter(characterDTO);

            // Track this upload
            Long roomId = characterDTO.getRoomId();
            Long userId = characterDTO.getUserId();

            roomUploads.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                    .put(userId, true);

            // Check if all players in room have uploaded
            boolean allUploaded = checkAllPlayersUploaded(roomId);

            // Send upload notification
            Map<String, Object> message = new HashMap<>();
            message.put("type", "CHARACTER_UPLOADED");
            message.put("playerId", userId);
            message.put("roomId", roomId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, message);

            // If all uploaded, send another message
            if (allUploaded) {
                Map<String, Object> allUploadedMessage = new HashMap<>();
                allUploadedMessage.put("type", "ALL_PLAYERS_UPLOADED");
                allUploadedMessage.put("roomId", roomId);
                messagingTemplate.convertAndSend("/topic/room/" + roomId, allUploadedMessage);
            }

            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "character", savedCharacter,
                            "allUploaded", allUploaded
                    ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCharacter(@PathVariable Long id, @RequestBody CharacterDTO characterDTO) {
        try {
            characterDTO.setId(id);
            CharacterDTO updatedCharacter = characterService.updateCharacter(characterDTO);
            return ResponseEntity.ok(updatedCharacter);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update character: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCharacter(@PathVariable Long id) {
        try {
            characterService.deleteCharacter(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete character: " + e.getMessage()));
        }
    }

    private boolean checkAllPlayersUploaded(Long roomId) {
        // Get all users in the room from waiting table
        List<Long> playersInRoom = waitingRepository.findByRoomId(roomId)
                .stream()
                .map(Waiting::getUserId)
                .collect(Collectors.toList());

        // Get uploads for this room
        Map<Long, Boolean> uploads = roomUploads.getOrDefault(roomId, new HashMap<>());

        // Check if all players have uploaded
        if (playersInRoom.isEmpty() || uploads.isEmpty()) {
            return false;
        }

        // Check that each player in the room has uploaded
        for (Long playerId : playersInRoom) {
            if (!uploads.getOrDefault(playerId, false)) {
                return false; // At least one player hasn't uploaded
            }
        }

        return true; // All players have uploaded
    }
}