'use client';

import React from 'react';
import Canvas from './Canvas';
import styles from './MainPage.module.css';
import { TitleText } from '@/ds/components/atoms/text/textWrapper';

const MainPage: React.FC = () => {
  const spaceName = '멋쟁이 사자';

  return (
    <div className={styles.mainPageContainer}>
      <TitleText variant="primary" style={{ fontSize: 32, fontWeight: 'bold' }}>
        {spaceName}의 공간
      </TitleText>
      <Canvas />
    </div>
  );
};

export default MainPage;
