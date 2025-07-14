export type Reservation = {
  id: string;
  roomName: string;
  userName: string;
  startTime: string;
  endTime: string;
};

export type ReservationRowProps = {
  reservation: Reservation;
};
