'use client';

import React from 'react';
import Carousel from '@/ds/components/molecules/carousel/Carousel';
import Card from '@/ds/components/atoms/card/Card';
import TimePicker from '@/ds/components/molecules/timePicker/TimePicker';
import { GetUserRsvDto } from '@/backend/user/reservations/dtos/GetUserRsvDto';
import styles from './MyReservationPage.module.css';

interface ReservationCarouselProps {
  reservations: GetUserRsvDto[];
  availableTimes: number[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ReservationCarousel = ({
  reservations,
  availableTimes,
  currentIndex,
  onIndexChange,
  onEdit,
  onDelete,
}: ReservationCarouselProps) => {
  return (
    <div className={styles.carouselContainer}>
      <Carousel
        className={styles.carouselStyle}
        currentIndex={currentIndex}
        onIndexChange={onIndexChange}
      >
        {reservations?.map((e, i) => (
          <Card
            key={e.rsvId}
            width={912}
            height={280}
            background="white"
            className={styles.reservationCard}
          >
            <div className={styles.spaceInfo}>
              <div
                className={styles.spaceRoomName}
              ><span className={styles.badge}>{`#${i + 1}`}</span>{`${e.spaceName} ${e.roomName}`}</div>
              <div className={styles.editTime}>마지막 수정: {e.lastEdit}</div>
            </div>

            <div className={styles.timePickerContainer}>
              <TimePicker
                availableTimes={availableTimes}
                reservedTimes={e.schedule}
                readonly
              />
            </div>

            <div className={styles.buttonContainer}>
              <div className={styles.buttonGroup}>
                <button onClick={onEdit} className={styles.actionButton}>
                  수정
                </button>
                <button onClick={onDelete} className={styles.actionButton}>
                  삭제
                </button>
              </div>
            </div>
          </Card>
        ))}
      </Carousel>
    </div>
  );
};

export default ReservationCarousel;
