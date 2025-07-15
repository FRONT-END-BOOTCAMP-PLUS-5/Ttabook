'use client';

import React from 'react';
import Canvas from './Canvas';
import styles from './MainPage.module.css';

const MainPage: React.FC = () => {
  const spaceName = '멋쟁이 사자';

  return (
    <div className={styles.mainPageContainer}>
        <h1 className={styles.title}>{spaceName}의 공간</h1>
        <Canvas />
    </div>
);
};

export default MainPage;