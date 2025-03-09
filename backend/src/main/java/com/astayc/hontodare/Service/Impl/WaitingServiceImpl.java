package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Entity.Waiting;
import com.astayc.hontodare.Repository.WaitingRepository;
import com.astayc.hontodare.Service.WaitingService;
import com.astayc.hontodare.Chat.ChatMessage;
import com.astayc.hontodare.Chat.Enum.MessageType;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaitingServiceImpl implements WaitingService {

    @Autowired
    private WaitingRepository waitingRepository;
    private ModelMapper modelMapper;


    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void joinRoom(Long roomId, Long userId) {
        Waiting waiting = new Waiting(roomId, userId);
        waitingRepository.save(waiting);

        // Check if two players are in the room
        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        if (waitings.size() >= 2) {
            // Notify players that they are matched
            ChatMessage matchMessage = ChatMessage.builder()
                    .content("You are matched and can start the game!")
                    .type(MessageType.JOIN)
                    .build();

            messagingTemplate.convertAndSend("/topic/match-updates", matchMessage);
        }
    }

    @Override
    public void leaveRoom(Long roomId, Long userId) {
        waitingRepository.deleteByRoomIdAndUserId(roomId, userId);
    }

    @Override
    public List<WaitingDTO> getRoomUsers(Long roomId) {
        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        return waitings.stream().map(waiting -> modelMapper.map(waiting, WaitingDTO.class)).collect(Collectors.toList());
    }
}