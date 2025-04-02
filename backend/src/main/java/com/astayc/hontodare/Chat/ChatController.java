package com.astayc.hontodare.Chat;

import com.astayc.hontodare.Chat.ChatMessage;
import com.astayc.hontodare.Chat.Enum.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j

public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sender = chatMessage.getSender();
        String content = chatMessage.getContent();
        MessageType type = chatMessage.getType();
        Long roomId = chatMessage.getRoomId();

        log.info("Chat message received: type={}, sender={}, roomId={}", type, sender, roomId);

        switch (type) {
            case CHAT:
                messagingTemplate.convertAndSend("/topic/public", chatMessage);
                break;
            case GAMEPLAY_CHAT:
                if (roomId != null) {
                    messagingTemplate.convertAndSend("/topic/room/" + roomId + "/gameplay", chatMessage);
                } else {
                    messagingTemplate.convertAndSend("/topic/gameplay-chat", chatMessage);
                }
                break;
            case FREE_CHAT:
                if (roomId != null) {
                    messagingTemplate.convertAndSend("/topic/room/" + roomId + "/free", chatMessage);
                } else {
                    messagingTemplate.convertAndSend("/topic/free-chat", chatMessage);
                }
                break;
            case SYSTEM_MESSAGE:
                if (roomId != null) {
                    messagingTemplate.convertAndSend("/topic/room/" + roomId + "/free", chatMessage);
                } else {
                    messagingTemplate.convertAndSend("/topic/system-messages", chatMessage);
                }
                break;
            default:
                throw new IllegalArgumentException("Unknown message type: " + type);
        }
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        ChatMessage joinMessage = ChatMessage.builder()
                .content(chatMessage.getSender() + " joined!")
                .type(MessageType.JOIN)
                .sender(chatMessage.getSender())
                .build();

        messagingTemplate.convertAndSend("/topic/public", joinMessage);
    }
}