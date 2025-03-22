package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Game;
import java.util.List;

public interface GameService {
    List<GameDTO> getAllGames();
    GameDTO createGame(GameDTO gameDTO);
    List<GameDTO> getGamesByRoomId(Long roomId);
    void deleteGame(Long gameId);
    GameDTO updateGame(GameDTO gameDTO);
    GameDTO getGameById(Long gameId);
    GameDTO getActiveGameByRoomId(Long roomId);
    List<GameDTO> getGamesByPlayerId(Long playerId);
}