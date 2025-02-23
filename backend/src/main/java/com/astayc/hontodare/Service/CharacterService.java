package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.CharacterDTO;
import com.astayc.hontodare.Entity.Character;
import java.util.List;
import java.util.UUID;

public interface CharacterService {
    List<CharacterDTO> getAllCharacters();
    CharacterDTO createCharacter(CharacterDTO characterDTO);
    List<CharacterDTO> getCharactersByCategory(String category);
    CharacterDTO updateCharacter(CharacterDTO characterDTO);
    void deleteCharacter(UUID id);
}