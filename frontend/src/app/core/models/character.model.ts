export interface Character {
  id: number;
  name: string;
  category: string;
  picUrl: string;
  glance: string;
  userId?: number;
  roomId?: number;
  user?: any;
  room?: any;
}
