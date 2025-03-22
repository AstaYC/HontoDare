package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Enum.GameMode;
import com.astayc.hontodare.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.astayc.hontodare.Entity.Enum.GameMode;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public List<GameDTO> getAllGames() {
        return gameService.getAllGames();
    }

    @PostMapping("/start")
    public ResponseEntity<GameDTO> startGame(@RequestBody GameDTO gameDTO) {
        gameDTO.setGameMode(GameMode.PvsP);

        if (gameDTO.getStartTime() == null) {
            gameDTO.setStartTime(new Timestamp(System.currentTimeMillis()));
        }

        gameDTO.setWinnerId(null);
        gameDTO.setEndTime(null);

        GameDTO createdGameDTO = gameService.createGame(gameDTO);
        return ResponseEntity.ok(createdGameDTO);
    }

    @PutMapping("/{gameId}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long gameId, @RequestBody GameDTO gameDTO) {
        gameDTO.setId(gameId);
        GameDTO updatedGameDTO = gameService.updateGame(gameDTO);
        return ResponseEntity.ok(updatedGameDTO);
    }

    @PutMapping("/{gameId}/end")
    public ResponseEntity<GameDTO> endGame(@PathVariable Long gameId, @RequestBody Map<String, Long> request) {
        Long winnerId = request.get("winnerId");
        GameDTO gameDTO = gameService.getGameById(gameId);

        if (gameDTO == null) {
            return ResponseEntity.notFound().build();
        }

        // Set winner and end time
        gameDTO.setWinnerId(winnerId);
        gameDTO.setEndTime(new Timestamp(System.currentTimeMillis()));

        GameDTO updatedGameDTO = gameService.updateGame(gameDTO);
        return ResponseEntity.ok(updatedGameDTO);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long gameId) {
        GameDTO gameDTO = gameService.getGameById(gameId);
        return ResponseEntity.ok(gameDTO);
    }

    @GetMapping("/room/{roomId}")
    public List<GameDTO> getGamesByRoomId(@PathVariable Long roomId) {
        return gameService.getGamesByRoomId(roomId);
    }

    @GetMapping("/room/{roomId}/active")
    public ResponseEntity<GameDTO> getActiveGameByRoomId(@PathVariable Long roomId) {
        GameDTO activeGame = gameService.getActiveGameByRoomId(roomId);
        return ResponseEntity.ok(activeGame);
    }

    @GetMapping("/player/{playerId}")
    public List<GameDTO> getGamesByPlayerId(@PathVariable Long playerId) {
        return gameService.getGamesByPlayerId(playerId);
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long gameId) {
        gameService.deleteGame(gameId);
        return ResponseEntity.noContent().build();
    }
}