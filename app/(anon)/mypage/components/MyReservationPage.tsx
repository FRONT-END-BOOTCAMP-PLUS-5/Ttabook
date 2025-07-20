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
import LoadingSpinner from '@/ds/components/atoms/loading/LoadingSpinner';

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
  const { data, isLoading, error, isSuccess } = useGets<GetUserRsvDto[]>(
    ['mypage'],
    '/user/reservations',
    true,
    {
      userId: user?.id ?? '',
    }
  );

  useEffect(() => {
    if (isSuccess && data) {
      const rsvs = data.map((e) => {
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
      setReservations(rsvs);
    }
  }, [data, isSuccess]);

  const handleClickEdit = () => {
    openModal('rsv-edit');
  };

  const handleClickDelete = () => {
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
          userId={user!.id}
          rsvId={reservations[carouselIndex].rsvId}
          onClose={() => closeModal('cancel-confirm')}
        />
      )}
      <main className={styles.container}>
        <section>
          {isLoading && (
            <div className={styles.container}>
              <h2 className={styles.title}>나의 예약 현황</h2>
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <div className={styles.container}>
              <h2 className={styles.title}>오류가 발생했습니다</h2>
            </div>
          )}
          {isSuccess && reservations && reservations.length > 0 && (
            <>
              <h2 className={styles.title}>나의 예약 현황</h2>
              <ReservationCarousel
                reservations={reservations}
                availableTimes={nineToFive}
                currentIndex={carouselIndex}
                onIndexChange={setCarouselIndex}
                onEdit={handleClickEdit}
                onDelete={handleClickDelete}
              />
            </>
          )}
          {isSuccess && reservations && reservations.length === 0 && (
            <div className={styles.container}>
              <h2 className={styles.title}>예약이 없습니다!</h2>
              <Image
                src={'/ttabook-surprised.png'}
                width={400}
                height={600}
                alt="예약이 없을 때 표시되는 따북이 이미지"
              />
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default MyReservationPage;
