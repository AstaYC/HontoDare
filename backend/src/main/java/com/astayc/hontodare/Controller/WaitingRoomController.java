package com.astayc.hontodare.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WaitingRoomController {

    private final SimpMessageSendingOperations messagingTemplate;

    // Map to track players in each room
    private final Map<Long, Set<String>> roomPlayers = new ConcurrentHashMap<>();

    @MessageMapping("/room.join")
    public void joinRoom(@Payload Map<String, Object> joinMessage,
                         SimpMessageHeaderAccessor headerAccessor) {

        Long roomId = ((Number) joinMessage.get("roomId")).longValue();
        String playerId = (String) joinMessage.get("playerId");

        log.info("Player {} joined room {}", playerId, roomId);


        // Store user info in WebSocket session
        headerAccessor.getSessionAttributes().put("username", playerId);
        headerAccessor.getSessionAttributes().put("roomId", roomId);

        // Add player to room
        roomPlayers.computeIfAbsent(roomId, k -> new CopyOnWriteArraySet<>()).add(playerId);
        Set<String> players = roomPlayers.get(roomId);

        // Notify room that player joined
        Map<String, Object> playerJoinedMessage = Map.of(
                "type", "PLAYER_JOINED",
                "playerId", playerId,
                "roomId", roomId,
                "playerCount", players.size()
        );

        messagingTemplate.convertAndSend("/topic/room/" + roomId, playerJoinedMessage);

        // Check if we have 2 players for a match
        if (players.size() == 2) {
            log.info("Match created in room {} with players {}", roomId, players);

            // Send match created notification
            Map<String, Object> matchCreatedMessage = Map.of(
                    "type", "MATCH_CREATED",
                    "roomId", roomId,
                    "players", players
            );

            messagingTemplate.convertAndSend("/topic/room/" + roomId, matchCreatedMessage);
        }
    }

    @MessageMapping("/room.leave")
    public void leaveRoom(@Payload Map<String, Object> leaveMessage,
                          SimpMessageHeaderAccessor headerAccessor) {
        Long roomId = ((Number) leaveMessage.get("roomId")).longValue();
        String playerId = (String) leaveMessage.get("playerId");

        log.info("Player {} left room {}", playerId, roomId);

        // Remove player from room
        Set<String> players = roomPlayers.get(roomId);
        if (players != null) {
            players.remove(playerId);

            // If room is empty, remove it
            if (players.isEmpty()) {
                roomPlayers.remove(roomId);
            }

            // Notify room that player left
            Map<String, Object> playerLeftMessage = Map.of(
                    "type", "PLAYER_LEFT",
                    "playerId", playerId,
                    "roomId", roomId,
                    "playerCount", players.size()
            );

            messagingTemplate.convertAndSend("/topic/room/" + roomId, playerLeftMessage);
        }
    }
}