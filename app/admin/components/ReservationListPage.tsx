'use client';

import React, { useState } from 'react';
import { AdminReservation } from './types';
import ReservationRow from './ReservationRow';
import styles from './ReservationListPage.module.css';
import { useGets } from '@/hooks/useGets';

const ITEMS_PER_PAGE = 10;

const ReservationListPage = () => {
  const { data } = useGets<AdminReservation[]>(
    ['admin', 'reservations'],
    '/admin/reservations'
  );

  const reservations = data ?? [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReservations = reservations.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
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
    <main className={styles.container}>
      <h2 className={styles.title}>예약 리스트</h2>
      <table className={styles.table}>
        <caption className="sr-only">예약 목록 테이블</caption>
        <thead>
          <tr>
            <th className={styles.headerCell}></th>
            <th className={styles.headerCell}>공간 이름</th>
            <th className={styles.headerCell}>예약자</th>
            <th className={styles.headerCell}>예약 시간</th>
          </tr>
        </thead>

        <tbody>
          {currentReservations.map((res: AdminReservation) => (
            <ReservationRow
              key={res.rsv.rsvId}
              user={res.user}
              room={res.room}
              rsv={res.rsv}
            />
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
    </main>
  );
};

export default ReservationListPage;
