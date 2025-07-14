'use client';

import React, { useState } from 'react';
import { Reservation } from './types';
import ReservationRow from './ReservationRow';
import styles from './ReservationListPage.module.css';

const reservations: Reservation[] = [
  {
    id: '1',
    roomName: '회의실 A',
    userName: '김지우',
    startTime: '14:00',
    endTime: '16:00',
  },
  {
    id: '2',
    roomName: '스터디룸 B',
    userName: '이서준',
    startTime: '09:00',
    endTime: '11:00',
  },
  {
    id: '3',
    roomName: '세미나실 C',
    userName: '박소연',
    startTime: '13:30',
    endTime: '15:00',
  },
  {
    id: '4',
    roomName: '회의실 A',
    userName: '최민준',
    startTime: '10:00',
    endTime: '12:00',
  },
  {
    id: '5',
    roomName: '스터디룸 B',
    userName: '이지아',
    startTime: '15:00',
    endTime: '17:00',
  },
];

const ITEMS_PER_PAGE = 10;

const ReservationListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReservations = reservations.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>예약 리스트</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headerCell}></th>
            <th className={styles.headerCell}>공간 이름</th>
            <th className={styles.headerCell}>예약자</th>
            <th className={styles.headerCell}>예약 시간</th>
          </tr>
        </thead>

        <tbody>
          {currentReservations.map((res) => (
            <ReservationRow key={res.id} reservation={res} />
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={styles.paginationButton}
        >
          ◀
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`${styles.paginationButton} ${
              currentPage === page ? styles.activePage : ''
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={styles.paginationButton}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default ReservationListPage;