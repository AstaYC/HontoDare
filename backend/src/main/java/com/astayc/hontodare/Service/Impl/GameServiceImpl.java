package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Game;
import com.astayc.hontodare.Repository.GameRepository;
import com.astayc.hontodare.Service.GameService;
import org.hibernate.sql.ast.tree.expression.Over;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GameServiceImpl implements GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<GameDTO> getAllGames() {
        List<Game> games = gameRepository.findAll();
        return games.stream().map(game -> modelMapper.map(game, GameDTO.class)).collect(Collectors.toList());
    }

    @Override
    public GameDTO createGame(GameDTO gameDTO) {
        Game game = modelMapper.map(gameDTO, Game.class);
        game = gameRepository.save(game);
        return modelMapper.map(game, GameDTO.class);
    }

    @Override
    public List<GameDTO> getGamesByRoomId(Long roomId) {
        List<Game> games = gameRepository.findByRoomId(roomId);
        return games.stream().map(game -> modelMapper.map(game, GameDTO.class)).collect(Collectors.toList());
    }

    @Override
    public void deleteGame(Long gameId) {
        gameRepository.deleteById(gameId);
    }

    @Override
    public GameDTO updateGame(GameDTO gameDTO) {
        Game existingGame = gameRepository.findById(gameDTO.getId()).orElseThrow();

        if (gameDTO.getEndTime() != null) {
            existingGame.setEndTime(gameDTO.getEndTime());
        }

        if (gameDTO.getWinnerId() != null) {
            com.astayc.hontodare.Entity.User winner = new com.astayc.hontodare.Entity.User();
            winner.setId(gameDTO.getWinnerId());
            existingGame.setWinner(winner);
        }
        if (gameDTO.getCharacter2Id() != null) {
            if (existingGame.getCharacter2() == null) {
                com.astayc.hontodare.Entity.Character character2 = new com.astayc.hontodare.Entity.Character();
                character2.setId(gameDTO.getCharacter2Id());
                existingGame.setCharacter2(character2);
            } else {
                existingGame.getCharacter2().setId(gameDTO.getCharacter2Id());
            }
        }

        Game updatedGame = gameRepository.save(existingGame);
        return modelMapper.map(updatedGame, GameDTO.class);
    }

    @Override
    public GameDTO getGameById(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found with id: " + gameId));
        return modelMapper.map(game, GameDTO.class);
    }

    @Override
    public GameDTO getActiveGameByRoomId(Long roomId) {
        // Find a game with the specified roomId and null endTime (meaning it's active)
        Game game = gameRepository.findByRoomIdAndEndTimeIsNull(roomId)
                .orElseThrow(() -> new RuntimeException("No active game found for room: " + roomId));
        return modelMapper.map(game, GameDTO.class);
    }

    @Override
    public List<GameDTO> getGamesByPlayerId(Long playerId) {
        List<Game> games = gameRepository.findByPlayer1IdOrPlayer2Id(playerId, playerId);
        return games.stream().map(game -> modelMapper.map(game, GameDTO.class)).collect(Collectors.toList());
    }

}