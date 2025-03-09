package com.astayc.hontodare.Chat;

import com.astayc.hontodare.Chat.ChatMessage;
import com.astayc.hontodare.Chat.Enum.MessageType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sender = chatMessage.getSender();
        String content = chatMessage.getContent();
        MessageType type = chatMessage.getType();

        switch (type) {
            case CHAT:
                messagingTemplate.convertAndSend("/topic/public", chatMessage);
                break;
            case GAMEPLAY_CHAT:
                messagingTemplate.convertAndSend("/topic/gameplay-chat", chatMessage);
                break;
            case FREE_CHAT:
                messagingTemplate.convertAndSend("/topic/free-chat", chatMessage);
                break;
            default:
                throw new IllegalArgumentException("Unknown message type: " + type);
        }
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add the username to the WebSocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        // Notify all users that a new user has joined
        ChatMessage joinMessage = ChatMessage.builder()
                .content(chatMessage.getSender() + " joined!")
                .type(MessageType.JOIN)
                .sender(chatMessage.getSender())
                .build();

        messagingTemplate.convertAndSend("/topic/public", joinMessage);
    }
}