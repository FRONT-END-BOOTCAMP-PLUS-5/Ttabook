'use client';

import React, { useEffect, useState } from 'react';
import styles from './MyReservationPage.module.css';
import { useGets } from '@/hooks/useGets';
import { useSession } from '@/app/providers/SessionProvider';
import { useModalStore } from '@/hooks/useModal';
import { GetUserRsvDto } from '@/backend/user/reservations/dtos/GetUserRsvDto';
import ReservationCarousel from './ReservationCarousel';
import Image from 'next/image';
import RsvEditModal from '../../components/modals/mypage/reservations/RsvEditModal';
import RsvCancelModal from '../../components/modals/mypage/cancelconfirms/RsvCancelModal';

const START_TIME = 9;
const TIME_PERIOD = 9; //
const nineToFive = Array.from({ length: TIME_PERIOD }, (_, i) => i + 9); // 9시 ~ 17시

const MyReservationPage = () => {
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const { openModal, isModalOpen, closeModal } = useModalStore();
  const [reservations, setReservations] = useState<GetUserRsvDto[] | null>(
    null
  );
  const { user } = useSession();
  const { data } = useGets<GetUserRsvDto[]>(
    ['mypage'],
    '/user/reservations',
    true,
    {
      userId: user?.id ?? '',
    }
  );

  useEffect(() => {
    const rsvs = data?.map((e) => {
      if (e && e.schedule.length > 0) {
        return {
          ...e,
          schedule: e.schedule
            .map((value, index) => {
              if (value === 1) {
                return index + START_TIME;
              }
            })
            .filter(Boolean) as number[],
        };
      }
      return {
        ...e,
        schedule: [],
      };
    });

    if (rsvs) {
      setReservations(rsvs);
    }
  }, [data]);

  const handleEdit = () => {
    openModal('rsv-edit');
  };

  const handleDelete = () => {
    openModal('cancel-confirm');
  };

  return (
    <>
      {isModalOpen('rsv-edit') && reservations && (
        <RsvEditModal
          roomId={reservations[carouselIndex].roomId}
          roomName={reservations[carouselIndex].roomName}
          onClose={() => closeModal('rsv-edit')}
        />
      )}
      {isModalOpen('cancel-confirm') && reservations && (
        <RsvCancelModal
          onConfirm={() => {}}
          onClose={() => closeModal('cancel-confirm')}
        />
      )}
      <div className={styles.container}>
        <div className="titleset">
          {reservations ? (
            <>
              <div className={styles.title}>나의 예약 현황</div>
              <ReservationCarousel
                reservations={reservations}
                availableTimes={nineToFive}
                currentIndex={carouselIndex}
                onIndexChange={setCarouselIndex}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <div className={styles.container}>
              <div className={styles.title}>예약이 없습니다!</div>
              <Image
                src={'/ttabook-surprised.png'}
                width={400}
                height={600}
                alt=""
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyReservationPage;
