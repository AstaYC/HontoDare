package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public List<GameDTO> getAllGames() {
        return gameService.getAllGames();
    }

    @PostMapping
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO gameDTO) {
        GameDTO createdGameDTO = gameService.createGame(gameDTO);
        return ResponseEntity.ok(createdGameDTO);
    }

    @GetMapping("/{roomId}")
    public List<GameDTO> getGamesByRoomId(@PathVariable Long roomId) {
        return gameService.getGamesByRoomId(roomId);
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long gameId) {
        gameService.deleteGame(gameId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<GameDTO> updateGame(@RequestBody GameDTO gameDTO) {
        GameDTO updatedGameDTO = gameService.updateGame(gameDTO);
        return ResponseEntity.ok(updatedGameDTO);
    }
}