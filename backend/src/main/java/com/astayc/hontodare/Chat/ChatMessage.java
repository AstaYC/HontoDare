package com.astayc.hontodare.Chat;

import com.astayc.hontodare.Chat.Enum.MessageType;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder


public class ChatMessage {

    private String content ;
    private String sender ;
    private MessageType type ;

}
