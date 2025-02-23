package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.CharacterDTO;
import com.astayc.hontodare.Entity.Character;
import com.astayc.hontodare.Repository.CharacterRepository;
import com.astayc.hontodare.Service.CharacterService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CharacterServiceImpl implements CharacterService {

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CharacterDTO> getAllCharacters() {
        List<Character> characters = characterRepository.findAll();
        return characters.stream().map(character -> modelMapper.map(character, CharacterDTO.class)).collect(Collectors.toList());
    }

    @Override
    public CharacterDTO createCharacter(CharacterDTO characterDTO) {
        Character character = modelMapper.map(characterDTO, Character.class);
        character = characterRepository.save(character);
        return modelMapper.map(character, CharacterDTO.class);
    }

    @Override
    public List<CharacterDTO> getCharactersByCategory(String category) {
        List<Character> characters = characterRepository.findByCategory(category);
        return characters.stream().map(character -> modelMapper.map(character, CharacterDTO.class)).collect(Collectors.toList());
    }

    @Override
    public CharacterDTO updateCharacter(CharacterDTO characterDTO) {
        Character existingCharacter = characterRepository.findById(characterDTO.getId()).orElseThrow();
        modelMapper.map(characterDTO, existingCharacter);
        Character updatedCharacter = characterRepository.save(existingCharacter);
        return modelMapper.map(updatedCharacter, CharacterDTO.class);
    }

    @Override
    public void deleteCharacter(UUID id) {
        characterRepository.deleteById(id);
    }
}