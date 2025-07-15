export interface TimePickerProps {
  availableTimes: number[];
  reservedTimes?: number[];
  onTimeSelect?: (startTime: number | null, endTime: number | null) => void;
}
