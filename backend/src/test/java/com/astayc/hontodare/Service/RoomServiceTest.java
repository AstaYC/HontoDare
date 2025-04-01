package com.astayc.hontodare.Service;

import com.astayc.hontodare.DTO.RoomDTO;
import com.astayc.hontodare.Entity.Room;
import com.astayc.hontodare.Repository.RoomRepository;
import com.astayc.hontodare.Service.Impl.RoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private RoomServiceImpl roomService;

    private Room testRoom;
    private RoomDTO testRoomDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Create test room
        testRoom = Room.builder()
                .id(1L)
                .name("Test Room")
                .description("Test Description")
                .category("test-category")
                .maxPlayers("10")
                .roomPicUrl("/assets/rooms/default.png")
                .build();

        // Create test room DTO
        testRoomDTO = new RoomDTO();
        testRoomDTO.setId(1L);
        testRoomDTO.setName("Test Room");
        testRoomDTO.setDescription("Test Description");
        testRoomDTO.setCategory("test-category");
        testRoomDTO.setMaxPlayers("10");
        testRoomDTO.setRoomPicUrl("/assets/rooms/default.png");

        // Configure ModelMapper behavior
        when(modelMapper.map(any(Room.class), eq(RoomDTO.class))).thenReturn(testRoomDTO);
        when(modelMapper.map(any(RoomDTO.class), eq(Room.class))).thenReturn(testRoom);
    }

    @Test
    void getAllRooms_ShouldReturnAllRooms() {
        // Arrange
        Room room2 = Room.builder()
                .id(2L)
                .name("Room 2")
                .category("test-category")
                .build();

        when(roomRepository.findAll()).thenReturn(Arrays.asList(testRoom, room2));

        RoomDTO roomDTO2 = new RoomDTO();
        roomDTO2.setId(2L);
        roomDTO2.setName("Room 2");
        roomDTO2.setCategory("test-category");

        when(modelMapper.map(room2, RoomDTO.class)).thenReturn(roomDTO2);

        // Act
        List<RoomDTO> result = roomService.getAllRooms();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test Room", result.get(0).getName());
        assertEquals("Room 2", result.get(1).getName());
    }

    @Test
    void createRoom_WithValidData_ShouldReturnRoom() {
        // Arrange
        RoomDTO newRoomDTO = new RoomDTO();
        newRoomDTO.setName("New Room");
        newRoomDTO.setMaxPlayers("5");
        newRoomDTO.setDescription("New Description");
        newRoomDTO.setCategory("test-category");

        Room newRoom = Room.builder()
                .id(2L)
                .name("New Room")
                .maxPlayers("5")
                .description("New Description")
                .category("test-category")
                .build();

        when(modelMapper.map(any(RoomDTO.class), eq(Room.class))).thenReturn(newRoom);
        when(roomRepository.save(any(Room.class))).thenReturn(newRoom);
        when(modelMapper.map(newRoom, RoomDTO.class)).thenReturn(newRoomDTO);

        // Act
        RoomDTO result = roomService.createRoom(newRoomDTO);

        // Assert
        assertNotNull(result);
        assertEquals("New Room", result.getName());
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void getRoomsByCategory_ShouldReturnRoomsInCategory() {
        // Arrange
        String category = "test-category";
        when(roomRepository.findByCategory(category)).thenReturn(List.of(testRoom));

        // Act
        List<RoomDTO> result = roomService.getRoomsByCategory(category);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Room", result.get(0).getName());
        assertEquals("test-category", result.get(0).getCategory());
    }

    @Test
    void deleteRoom_ShouldCallRepository() {
        // Act
        roomService.deleteRoom(1L);

        // Assert
        verify(roomRepository).deleteById(1L);
    }

    @Test
    void updateRoom_ShouldUpdateAndReturnRoom() {
        // Arrange
        RoomDTO updateDTO = new RoomDTO();
        updateDTO.setId(1L);
        updateDTO.setName("Updated Room");
        updateDTO.setMaxPlayers("20");
        updateDTO.setDescription("Updated Description");

        Room existingRoom = Room.builder()
                .id(1L)
                .name("Test Room")
                .build();

        Room updatedRoom = Room.builder()
                .id(1L)
                .name("Updated Room")
                .maxPlayers("20")
                .description("Updated Description")
                .build();

        when(roomRepository.findById(1L)).thenReturn(Optional.of(existingRoom));
        when(roomRepository.save(any(Room.class))).thenReturn(updatedRoom);
        when(modelMapper.map(updatedRoom, RoomDTO.class)).thenReturn(updateDTO);

        // Act
        RoomDTO result = roomService.updateRoom(updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Room", result.getName());
        verify(roomRepository).findById(1L);
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void updateRoom_WithNonExistingRoom_ShouldThrowException() {
        // Arrange
        RoomDTO updateDTO = new RoomDTO();
        updateDTO.setId(99L);
        updateDTO.setName("Updated Room");

        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class, () -> roomService.updateRoom(updateDTO));
    }
}