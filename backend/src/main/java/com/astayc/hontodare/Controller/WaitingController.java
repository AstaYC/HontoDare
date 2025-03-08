package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Service.WaitingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/waiting")
public class WaitingController {

    @Autowired
    private WaitingService waitingService;

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable Long roomId, @RequestHeader Long userId) {
        waitingService.joinRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable Long roomId, @RequestHeader Long userId) {
        waitingService.leaveRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/users")
    public List<WaitingDTO> getRoomUsers(@PathVariable Long roomId) {
        return waitingService.getRoomUsers(roomId);
    }
}