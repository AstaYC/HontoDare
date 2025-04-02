package com.astayc.hontodare.Service.Impl;

import com.astayc.hontodare.DTO.WaitingDTO;
import com.astayc.hontodare.Entity.Waiting;
import com.astayc.hontodare.Repository.WaitingRepository;
import com.astayc.hontodare.Service.WaitingService;
import com.astayc.hontodare.Chat.ChatMessage;
import com.astayc.hontodare.Chat.Enum.MessageType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WaitingServiceImpl implements WaitingService {

    @Autowired
    private WaitingRepository waitingRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void joinRoom(Long roomId, Long userId) {
        if (waitingRepository.existsByRoomIdAndUserId(roomId, userId)) {
            log.info("User {} is already in room {}", userId, roomId);
            return;
        }

        List<Waiting> userWaitings = waitingRepository.findByUserId(userId);
        if (!userWaitings.isEmpty()) {
            log.info("User {} is already in another room", userId);
            userWaitings.forEach(w -> waitingRepository.deleteById(w.getId()));
        }

        Waiting waiting = new Waiting(roomId, userId);
        waitingRepository.save(waiting);

        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        if (waitings.size() >= 2) {
            ChatMessage matchMessage = ChatMessage.builder()
                    .roomId(roomId)
                    .players(waitings.stream().map(Waiting::getUserId).collect(Collectors.toList()))
                    .content("You are matched and can start the game!")
                    .type(MessageType.MATCH)
                    .build();

            messagingTemplate.convertAndSend("/topic/match-updates", matchMessage);
        }
    }
    @Override
    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        waitingRepository.deleteByRoomIdAndUserId(roomId, userId);

        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        if (waitings.isEmpty()) {
            // Notify that the room is empty
            ChatMessage leaveMessage = ChatMessage.builder()
                    .content("The room is now empty.")
                    .type(MessageType.LEAVE)
                    .build();

            messagingTemplate.convertAndSend("/topic/match-updates", leaveMessage);
        }
    }

    @Override
    public List<WaitingDTO> getRoomUsers(Long roomId) {
        List<Waiting> waitings = waitingRepository.findByRoomId(roomId);
        return waitings.stream().map(waiting -> modelMapper.map(waiting, WaitingDTO.class)).collect(Collectors.toList());
    }
}