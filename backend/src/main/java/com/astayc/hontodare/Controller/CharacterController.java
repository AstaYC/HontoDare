package com.astayc.hontodare.Controller;

import com.astayc.hontodare.DTO.CharacterDTO;
import com.astayc.hontodare.Service.CharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @GetMapping
    public List<CharacterDTO> getAllCharacters() {
        return characterService.getAllCharacters();
    }

    @PostMapping
    public ResponseEntity<CharacterDTO> createCharacter(@RequestBody CharacterDTO characterDTO) {
        CharacterDTO createdCharacterDTO = characterService.createCharacter(characterDTO);
        return ResponseEntity.ok(createdCharacterDTO);
    }

    @GetMapping("/category/{category}")
    public List<CharacterDTO> getCharactersByCategory(@PathVariable String category) {
        return characterService.getCharactersByCategory(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable UUID id) {
        characterService.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<CharacterDTO> updateCharacter(@RequestBody CharacterDTO characterDTO) {
        CharacterDTO updatedCharacterDTO = characterService.updateCharacter(characterDTO);
        return ResponseEntity.ok(updatedCharacterDTO);
    }
}