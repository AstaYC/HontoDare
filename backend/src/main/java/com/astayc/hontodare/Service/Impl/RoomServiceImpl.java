package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.RoomDTO;
import com.astayc.hontodare.Entity.Room;
import com.astayc.hontodare.Repository.RoomRepository;
import com.astayc.hontodare.Service.RoomService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<RoomDTO> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return rooms.stream().map(room -> modelMapper.map(room, RoomDTO.class)).collect(Collectors.toList());
    }

    @Override
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = modelMapper.map(roomDTO, Room.class);
        room = roomRepository.save(room);
        return modelMapper.map(room, RoomDTO.class);
    }

    @Override
    public List<RoomDTO> getRoomsByCategory(String category) {
        List<Room> rooms = roomRepository.findByCategory(category);
        return rooms.stream().map(room -> modelMapper.map(room, RoomDTO.class)).collect(Collectors.toList());
    }

    @Override
    public void deleteRoom(UUID roomId) {
        roomRepository.deleteById(roomId);
    }

    @Override
    public RoomDTO updateRoom(RoomDTO roomDTO) {
        Room existingRoom = roomRepository.findById(roomDTO.getId()).orElseThrow();
        modelMapper.map(roomDTO, existingRoom);
        Room updatedRoom = roomRepository.save(existingRoom);
        return modelMapper.map(updatedRoom, RoomDTO.class);
    }
}