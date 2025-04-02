package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Enum.GameMode;
import com.astayc.hontodare.Entity.Game;
import com.astayc.hontodare.Repository.GameRepository;
import com.astayc.hontodare.Service.GameService;
import com.astayc.hontodare.Service.Impl.MatchTrackingService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.astayc.hontodare.Entity.Enum.GameMode;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;


@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private MatchTrackingService matchTrackingService;


    @Autowired
    private ModelMapper modelMapper;

    @GetMapping
    public List<GameDTO> getAllGames() {
        return gameService.getAllGames();
    }

    @PostMapping("/complete")
    public ResponseEntity<GameDTO> completeGame(@RequestBody GameDTO gameDTO) {
        try {
            Optional<Game> existingGame = gameRepository.findUnfinishedGameForPlayers(
                    gameDTO.getRoomId(),
                    gameDTO.getPlayer1Id(),
                    gameDTO.getPlayer2Id()
            );   

            if (existingGame.isPresent()) {
                Game game = existingGame.get();
                GameDTO updateDTO = modelMapper.map(game, GameDTO.class);

                updateDTO.setCharacter2Id(gameDTO.getCharacter2Id());
                updateDTO.setEndTime(new Timestamp(System.currentTimeMillis()));
                return ResponseEntity.ok(gameService.updateGame(updateDTO));
            } else {
                gameDTO.setStartTime(new Timestamp(System.currentTimeMillis()));
                gameDTO.setEndTime(new Timestamp(System.currentTimeMillis()));
                gameDTO.setGameMode(GameMode.PvsP);
                return ResponseEntity.ok(gameService.createGame(gameDTO));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
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

    @PutMapping("/{gameId}/update-character")
    public ResponseEntity<GameDTO> updateGameCharacter(
            @PathVariable Long gameId,
            @RequestParam Long playerId,
            @RequestParam Long characterId
    ) {
        GameDTO gameDTO = gameService.getGameById(gameId);

        if (gameDTO == null) {
            return ResponseEntity.notFound().build();
        }

        if (playerId.equals(gameDTO.getPlayer1Id())) {
            gameDTO.setCharacter1Id(characterId);
        } else if (playerId.equals(gameDTO.getPlayer2Id())) {
            gameDTO.setCharacter2Id(characterId);
        }

        GameDTO updatedGame = gameService.updateGame(gameDTO);
        return ResponseEntity.ok(updatedGame);
    }
}