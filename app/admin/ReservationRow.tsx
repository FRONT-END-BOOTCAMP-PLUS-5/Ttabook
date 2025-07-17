'use client';

import React from 'react';
import { ReservationRowProps } from './types';
import styles from './ReservationRow.module.css';

const ReservationRow = ({ user, room, rsv }: ReservationRowProps) => {
  return (
    <tr className={styles.row}>
      <td className={`${styles.cell} ${styles.firstCell}`}>
        <div className={styles.icon}>🛋️</div>
      </td>

      <td className={styles.cell}>
        <strong>{room.roomName}</strong>
      </td>

      <td className={styles.cell}>{user.userId}</td>

      <td className={`${styles.cell} ${styles.lastCell}`}>
        {rsv.startTime.toLocaleString('ko-KR')} - {rsv.endTime.toLocaleString('ko-KR')}
      </td>
    </tr>
  );
}

export default ReservationRow;