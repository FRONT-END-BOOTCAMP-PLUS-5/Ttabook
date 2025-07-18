'use client';

import React, { useEffect } from 'react';
import Canvas from './Canvas';
import styles from './MainPage.module.css';
import { TitleText } from '@/ds/components/atoms/text/textWrapper';
import { useGets } from '@/hooks/useGets';
import { Space } from './types';
import LoadingSpinner from '@/ds/components/atoms/loading/LoadingSpinner';

const MainPage: React.FC = () => {
  const SPACE_ID = 150;
  const { data, isLoading } = useGets<Space>(['rooms'], `/spaces/${SPACE_ID}`);

  useEffect(() => {
    if (data) {
      console.log('Space Data:', data);
    }
  }, [data]);

  return (
    <div className={styles.mainPageContainer}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TitleText
            variant="primary"
            style={{ fontSize: 32, fontWeight: 'bold' }}
          >
            {data?.spaceName}의 공간
          </TitleText>
          <Canvas rooms={data?.roomInfo || []} />
        </>
      )}
    </div>
  );
};

export default MainPage;
