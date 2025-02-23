package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.GameDTO;
import com.astayc.hontodare.Entity.Game;
import com.astayc.hontodare.Repository.GameRepository;
import com.astayc.hontodare.Service.GameService;
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
    public List<GameDTO> getGamesByRoomId(UUID roomId) {
        List<Game> games = gameRepository.findByRoomId(roomId);
        return games.stream().map(game -> modelMapper.map(game, GameDTO.class)).collect(Collectors.toList());
    }

    @Override
    public void deleteGame(UUID gameId) {
        gameRepository.deleteById(gameId);
    }

    @Override
    public GameDTO updateGame(GameDTO gameDTO) {
        Game existingGame = gameRepository.findById(gameDTO.getId()).orElseThrow();
        modelMapper.map(gameDTO, existingGame);
        Game updatedGame = gameRepository.save(existingGame);
        return modelMapper.map(updatedGame, GameDTO.class);
    }
}