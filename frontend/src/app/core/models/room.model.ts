// src/app/core/models/room.model.ts
export interface Room {
  id: number;
  name: string;
  description: string;
  maxPlayers: string;
  category: string;
  roomPicUrl?: string;
}
