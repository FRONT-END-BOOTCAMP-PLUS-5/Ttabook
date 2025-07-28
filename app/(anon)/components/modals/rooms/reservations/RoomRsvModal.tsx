import Modal from '@/ds/components/atoms/modal/Modal';
import styles from './RoomRsvModal.module.css';
import { useGets } from '@/hooks/useGets';
import TimePicker from '@/ds/components/molecules/timePicker/TimePicker';
import { useEffect, useRef, useState } from 'react';
import Button from '@/ds/components/atoms/button/Button';
import Image from 'next/image';
import { CaptionText } from '@/ds/components/atoms/text/textWrapper';
import { usePosts } from '@/hooks/usePosts';
import { useSession } from '@/app/providers/SessionProvider';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/ds/components/atoms/loading/LoadingSpinner';
import { useToastStore } from '@/hooks/useToast';

interface RoomRsvModalProps {
  onClose: () => void;
  roomId: number;
  roomName: string;
}

const START_TIME = 9;
const TIME_PERIOD = 9; //
const nineToFive = Array.from({ length: TIME_PERIOD }, (_, i) => i + 9); // 9시 ~ 17시
const numberHourToDate = (hour: number): string => {
  const date = new Date();

  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toUTCString();
};

const RoomRsvModal = ({ onClose, roomId, roomName }: RoomRsvModalProps) => {
  const router = useRouter();
  const onSuccess = () => {
    onClose();
    router.push('/mypage');
  };
  const onError = () => {};
  const { mutate } = usePosts({ onSuccess, onError });
  const { data, isLoading } = useGets<{ schedule: number[] }>(
    ['room-reservations'],
    '/rooms/reservations',
    true,
    {
      roomId: roomId.toString(),
    }
  );
  const [reservedTimes, setReservedTimes] = useState(
    Array.from({ length: TIME_PERIOD }, () => 0)
  );
  const { user } = useSession();
  const reservationTime = useRef<number[] | null>(null);
  const { showToast } = useToastStore();

  const onTimeSelect = (start: number | null, end: number | null) => {
    if (start && end) {
      reservationTime.current = [start, end];
    }
  };

  useEffect(() => {
    if (data && data?.schedule.length > 0) {
      const rsvs: number[] = data.schedule
        .map((value, index) => {
          if (value === 1) {
            return index + START_TIME;
          }
        })
        .filter(Boolean) as number[];

      setReservedTimes(rsvs);
    }
  }, [data]);

  const handleClickRsv = () => {
    if (!user) {
      showToast('로그인 후 사용해주세요!', 'danger');
      return;
    }
    if (!reservationTime.current || reservationTime.current.length < 2) {
      showToast('예약시간을 정확히 선택해주세요', 'accent');
      return;
    }

    const rsvData = {
      userId: user?.id,
      roomId,
      startTime: numberHourToDate(reservationTime.current[0]),
      endTime: numberHourToDate(reservationTime.current[1]),
    };

    mutate({
      postData: {
        reservationData: rsvData,
      },
      path: '/user/reservations',
    });
  };

  return (
    <Modal width={960} height={600}>
      <Modal.Title>{roomName}의 방</Modal.Title>
      <Modal.Body>
        <div className={styles['modal-container']}>
          <div className={styles['image-container']}>
            <picture>
              <source srcSet="/ttabook-basic.avif" type="image/avif" />
              <source srcSet="/ttabook-basic.webp" type="image/webp" />
              <Image
                src={'/ttabook-basic.png'}
                alt="ttabook basic image"
                width={166}
                height={200}
              />
            </picture>
            <CaptionText style={{ margin: 0 }} variant="secondary">
              최대 4시간 예약이 가능합니다
            </CaptionText>
          </div>
          {isLoading ? (
            <LoadingSpinner size={30} />
          ) : (
            <TimePicker
              availableTimes={nineToFive}
              reservedTimes={reservedTimes}
              onTimeSelect={onTimeSelect}
            />
          )}
          <div className={styles['button-container']}>
            <Button variant="primary" size="sm" onClick={handleClickRsv}>
              예약하기
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.CloseButton onClick={onClose} />
    </Modal>
  );
};

export default RoomRsvModal;
