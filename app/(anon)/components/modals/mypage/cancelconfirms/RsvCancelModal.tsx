'use client';

import React from 'react';
import Modal from '@/ds/components/atoms/modal/Modal';
import Button from '@/ds/components/atoms/button/Button';
import Text from '@/ds/components/atoms/text/Text';
import Image from 'next/image';
import styles from './RsvCancelModal.module.css';
import { useDeletes } from '@/hooks/useDeletes';
import { useQueryClient } from '@tanstack/react-query';
import { GetUserRsvDto } from '@/backend/user/reservations/dtos/GetUserRsvDto';

interface RsvCancelModalProps {
  userId: string;
  rsvId: string;
  onClose: () => void;
}

const RsvCancelModal: React.FC<RsvCancelModalProps> = ({
  userId,
  rsvId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const onSuccess = () => {};
  const onError = () => {};
  const { mutate } = useDeletes({ onSuccess, onError });

  const handleConfirm = () => {
    mutate({
      deleteData: {
        rsvId: rsvId,
        userId: userId,
      },
      path: '/user/reservations',
    });
    queryClient.setQueryData(['mypage'], (oldData: GetUserRsvDto[]) =>
      oldData.filter((e) => e.rsvId !== rsvId)
    );
    onClose();
  };

  return (
    <Modal width={500} height={300} onClose={onClose}>
      <Modal.CloseButton />
      <Modal.Body className={styles.modalBody}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <Text size="xl" variant="primary" className={styles.title}>
              예약을
            </Text>
            <Text size="xl" variant="primary" className={styles.title}>
              취소하시겠습니까?
            </Text>
          </div>
          <div className={styles.imageSection}>
            <picture>
              <source srcSet="/ttabook-surprised.avif" type="image/avif" />
              <source srcSet="/ttabook-surprised.webp" type="image/webp" />
              <Image
                src="/ttabook-surprised.png"
                width={120}
                height={120}
                alt="surprised turtle"
                className={styles.turtleImage}
              />
            </picture>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button variant="primary" size="md" onClick={handleConfirm}>
            확인
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RsvCancelModal;
