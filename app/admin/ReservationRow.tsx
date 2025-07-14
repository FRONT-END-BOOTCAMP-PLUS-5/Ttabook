'use client';

import React from 'react';
import { ReservationRowProps } from './types';
import styles from './ReservationRow.module.css';

const ReservationRow = ({ reservation: rsv }: ReservationRowProps) => {
  return (
    <tr className={styles.row}>
      <td className={`${styles.cell} ${styles.firstCell}`}>
        <div className={styles.icon}>🛋️</div>
      </td>

      <td className={styles.cell}>
        <strong>{rsv.roomName}</strong>
      </td>

      <td className={styles.cell}>{rsv.userName}</td>

      <td className={`${styles.cell} ${styles.lastCell}`}>
        {rsv.startTime} - {rsv.endTime}
      </td>
    </tr>
  );
}

export default ReservationRow;