package com.astayc.hontodare.DTO;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CharacterDTO {

    private UUID id;
    private String name;
    private String category;
    private String picUrl;
    private String glance;
}