export interface TimeTileProps {
  time: number;
  isReserved: boolean;
  isSelected: boolean;
  onClick: (time: number) => void;
  isLastTile: boolean;
  readonly?: boolean;
}
