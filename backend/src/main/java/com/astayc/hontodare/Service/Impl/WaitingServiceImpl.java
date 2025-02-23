package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Entity.Waiting;
import com.astayc.hontodare.Repository.WaitingRepository;
import com.astayc.hontodare.Service.WaitingService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WaitingServiceImpl implements WaitingService {

    @Autowired
    private WaitingRepository waitingRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public void joinRoom(UUID roomId, UUID userId) {
        Waiting waiting = new Waiting(roomId, userId);
        waitingRepository.save(waiting);
    }

    @Override
    public void leaveRoom(UUID roomId, UUID userId) {
        waitingRepository.deleteByRoomIdAndUserId(roomId, userId);
    }

    @Override
    public List<WaitingDTO> getRoomUsers(UUID roomId) {
        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        return waitings.stream().map(waiting -> modelMapper.map(waiting, WaitingDTO.class)).collect(Collectors.toList());
    }
}