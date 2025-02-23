package com.astayc.hontodare.Repository;

import com.astayc.hontodare.Entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Boolean existsByName(String name);
    List<Room> findByCategory(String category);
    void deleteById(UUID roomId);
}