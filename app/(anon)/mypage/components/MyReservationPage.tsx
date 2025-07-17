'use client'

import React from 'react';
import Carousel from '@/ds/components/molecules/carousel/Carousel';
import Card from '@/ds/components/atoms/card/Card';
import TimePicker from '@/ds/components/molecules/timePicker/TimePicker';
import styles from './MyReservationPage.module.css';

const MyReservationPage = () => {
  const availableTimes = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const reservedTimes = [10];

  const handleTimeSelect = (startTime: number | null, endTime: number | null) => {
    console.log('Selected time range:', startTime, endTime);
  };

  const handleEdit = () => {
    console.log('Edit reservation');
  };

  const handleDelete = () => {
    console.log('Delete reservation');
  };

  const reservationCard = (
    <Card
      width={900}
      height={280}
      background="white"
      className={styles.reservationCard}
    >
      <div className={styles.spaceInfo}>
        <div className={styles.spaceName}>
          멋쟁이 사자 공간
        </div>
        <div className={styles.roomName}>
          멋쟁이의 방
        </div>
      </div>
      
      <div className={styles.timePickerContainer}>
        <TimePicker
          availableTimes={availableTimes}
          reservedTimes={reservedTimes}
          onTimeSelect={handleTimeSelect}
        />
      </div>
      
      <div className={styles.buttonContainer}>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleEdit}
            className={styles.actionButton}
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className={styles.actionButton}
          >
            삭제
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        나의 예약 현황
      </div>
      <div className={styles.carouselContainer}>
        <Carousel className={styles.carouselStyle}>
          {[reservationCard]}
        </Carousel>
      </div>
    </div>
  );
};

export default MyReservationPage;