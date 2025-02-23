// WaitingRepository.java
package com.astayc.hontodare.Repository;

import com.astayc.hontodare.Entity.Waiting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, UUID> {
    List<Waiting> findByRoomId(UUID roomId);
    void deleteByRoomIdAndUserId(UUID roomId, UUID userId);
}