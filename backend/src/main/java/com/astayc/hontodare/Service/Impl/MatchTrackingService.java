package com.astayc.hontodare.Service.Impl;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MatchTrackingService {
    // Key: roomId, Value: Set of player IDs in current match
    private final Map<Long, Set<Long>> activeMatches = new ConcurrentHashMap<>();

    public boolean isCurrentMatch(Long roomId, Long player1, Long player2) {
        Set<Long> players = activeMatches.get(roomId);
        return players != null &&
                players.contains(player1) &&
                players.contains(player2);
    }

    public void startNewMatch(Long roomId, Set<Long> playerIds) {
        activeMatches.put(roomId, playerIds);
    }

    public void endMatch(Long roomId) {
        activeMatches.remove(roomId);
    }
}