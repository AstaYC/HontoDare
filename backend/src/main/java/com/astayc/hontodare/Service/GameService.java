package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Game;
import java.util.List;
import java.util.UUID;

public interface GameService {
    List<GameDTO> getAllGames();
    GameDTO createGame(GameDTO gameDTO );
    List<GameDTO> getGamesByRoomId(UUID roomId);
    void deleteGame(UUID gameId);
    GameDTO updateGame(GameDTO gameDTO);
}