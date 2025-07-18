import React, { useState } from 'react';
import { TimeTile } from './TimeTile';
import '../../../styles/globals.css';
import styles from './TimePicker.module.css';
import { TimePickerProps } from './TimePicker.types';

const TimePicker = ({
  availableTimes,
  reservedTimes = [],
  onTimeSelect,
  readonly = false,
}: TimePickerProps) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const handleTileClick = (time: number) => {
    let newStartTime: number | null = null;
    let newEndTime: number | null = null;

    if (startTime && !endTime && time > startTime) {
      const selectedRange = availableTimes.filter(
        (t) => t >= startTime && t <= time
      );
      const reservedInRange = selectedRange.filter((t) =>
        reservedTimes.includes(t)
      ).length;
      const actualSelectedCount = selectedRange.length - reservedInRange;

      if (actualSelectedCount <= 4) {
        newStartTime = startTime;
        newEndTime = time;
      } else {
        newStartTime = time;
        newEndTime = null;
      }
    } else {
      newStartTime = time;
      newEndTime = null;
    }

    setStartTime(newStartTime);
    setEndTime(newEndTime);
    if (onTimeSelect) {
      onTimeSelect(newStartTime, newEndTime);
    }
  };

  const isSelected = (time: number) => {
    if (!startTime) return false;
    if (!endTime) return time === startTime;
    return time >= startTime && time <= endTime;
  };

  return (
    <div className={styles['time-picker-container']}>
      {availableTimes.map((time, index) => (
        <TimeTile
          key={time}
          time={time}
          isReserved={reservedTimes.includes(time)}
          isSelected={isSelected(time)}
          onClick={handleTileClick}
          isLastTile={index === availableTimes.length - 1}
          readonly={readonly}
        />
      ))}
    </div>
  );
};

export default TimePicker;
