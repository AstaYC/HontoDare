package com.astayc.hontodare.Repository;

import com.astayc.hontodare.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByRoomId(Long roomId);
    Optional<Game> findByRoomIdAndEndTimeIsNull(Long roomId);
    List<Game> findByPlayer1IdOrPlayer2Id(Long player1Id, Long player2Id);

    @Query("SELECT g FROM Game g WHERE " +
            "g.room.id = :roomId AND " +
            "((g.player1.id = :player1 AND g.player2.id = :player2) OR " +
            "(g.player1.id = :player2 AND g.player2.id = :player1)) AND " +
            "g.character2.id IS NULL")
    Optional<Game> findUnfinishedGameForPlayers(
            @Param("roomId") Long roomId,
            @Param("player1") Long player1,
            @Param("player2") Long player2
    );

}