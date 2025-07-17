type User = {
  userId: string;
};

type Room = {
  roomId: number;
  roomName: string;
};

export type Rsv = {
  rsvId: string;
  startTime: Date;
  endTime: Date;
};

export type ReservationRowProps = {
  user: User;
  room: Room;
  rsv: Rsv;
};

export type AdminReservation = {
  spaceId: number,
  room: Room,
  user: User,
  rsv: Rsv
};
