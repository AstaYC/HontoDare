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
@CrossOrigin(origins = "http://localhost:4200")

public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private WaitingRepository waitingRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

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

            ObjectMapper mapper = new ObjectMapper();
            CharacterDTO characterDTO = mapper.readValue(characterJson, CharacterDTO.class);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

                Path uploadPath = Paths.get("frontend/src/assets/characterPic");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.write(uploadPath.resolve(fileName), file.getBytes());

                characterDTO.setPicUrl("/assets/characterPic/" + fileName);
            }

            CharacterDTO savedCharacter = characterService.createCharacter(characterDTO);

            Long roomId = characterDTO.getRoomId();
            Long userId = characterDTO.getUserId();

            roomUploads.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                    .put(userId, true);

            boolean allUploaded = checkAllPlayersUploaded(roomId);

            Map<String, Object> message = new HashMap<>();
            message.put("type", "CHARACTER_UPLOADED");
            message.put("playerId", userId);
            message.put("roomId", roomId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId, message);

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
        List<Long> playersInRoom = waitingRepository.findByRoomId(roomId)
                .stream()
                .map(Waiting::getUserId)
                .collect(Collectors.toList());

        Map<Long, Boolean> uploads = roomUploads.getOrDefault(roomId, new HashMap<>());

        if (playersInRoom.isEmpty() || uploads.isEmpty()) {
            return false;
        }

        for (Long playerId : playersInRoom) {
            if (!uploads.getOrDefault(playerId, false)) {
                return false; // At least one player hasn't uploaded
            }
        }

        return true;
    }
}