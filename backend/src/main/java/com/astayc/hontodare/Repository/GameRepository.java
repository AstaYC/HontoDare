package com.astayc.hontodare.Repository;

import com.astayc.hontodare.Entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByRoomId(Long roomId);
}