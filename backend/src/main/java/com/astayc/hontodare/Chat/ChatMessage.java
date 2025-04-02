package com.astayc.hontodare.Chat;

import com.astayc.hontodare.Chat.Enum.MessageType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private String sender;
    private String content;
    private MessageType type;
    private Long roomId;
    private List<Long> players;
}