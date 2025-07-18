import Modal from '@/ds/components/atoms/modal/Modal';
import { Room } from '../../../types';
import styles from './RoomInfoModal.module.css';

interface RoomInfoModalProps {
  onClose: () => void;
  room: Room;
}
const RoomInfoModal = ({ room, onClose }: RoomInfoModalProps) => {
  return (
    <Modal>
      <Modal.Title>{room.name}</Modal.Title>
      <Modal.Body>
        <div className={styles['info-detail']}>{room.detail}</div>
      </Modal.Body>
      <Modal.CloseButton onClick={onClose} />
    </Modal>
  );
};

export default RoomInfoModal;
