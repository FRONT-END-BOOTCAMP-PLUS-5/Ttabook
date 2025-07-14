import React from 'react';
import { TimeTileProps } from './TimeTile.types';
import '../../../styles/globals.css';
import styles from './TimeTile.module.css';
import { CaptionText } from '../../atoms/text/textWrapper';

export const TimeTile = ({
  time,
  isReserved,
  isSelected,
  onClick,
  isLastTile,
}: TimeTileProps) => {
  const handleClick = () => {
    if (!isReserved) {
      onClick(time);
    }
  };

  const tileNames = [styles['time-tile'], isSelected ? styles['selected'] : ''];
  return (
    <div className={styles['time-tile-wrapper']}>
      <button
        className={tileNames.filter(Boolean).join(' ')}
        onClick={handleClick}
        disabled={isReserved}
      />
      <div className={styles['time-label-container']}>
        <CaptionText
          size="sm"
          variant={'primary'}
          className={styles['time-label-start']}
          style={{
            margin: 0,
            padding: 0,
          }}
        >
          {time}:00
        </CaptionText>
        {isLastTile && (
          <CaptionText
            size="sm"
            variant={'primary'}
            className={styles['time-label-end']}
            style={{
              margin: 0,
              padding: 0,
            }}
          >
            {time + 1}:00
          </CaptionText>
        )}
      </div>
    </div>
  );
};
