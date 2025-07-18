import React from 'react';
import { Group, Rect, Circle, RegularPolygon } from 'react-konva';
import { PersonIconProps, RoomFurnitureProps } from './types';

const PersonIcon: React.FC<PersonIconProps> = ({ x, y, color = '#718096' }) => {
  return (
    <Group x={x} y={y}>
      <Circle x={0} y={0} radius={3} fill={color} />
      <RegularPolygon x={0} y={7} sides={3} radius={6} fill={color} />
    </Group>
  );
};

const RoomFurniture: React.FC<RoomFurnitureProps> = ({
  x,
  y,
  roomWidth,
  roomHeight,
}) => {
  const tableWidth = 43;
  const tableHeight = 15;
  const spacing = 6;
  const personSize = 12;

  // 실제 테이블과 사람 포함 전체 영역 크기
  const fullWidth = tableWidth + spacing * 2 + personSize * 2;
  const fullHeight = tableHeight + spacing * 2 + personSize * 2;

  // Room 중앙에 위치시킬 그룹의 시작 좌표
  const groupX = x + roomWidth / 2 - fullWidth / 2;
  const groupY = y + roomHeight / 2 - fullHeight / 2;

  const chairColor = '#718096';

  // 사람 배치 기준 좌표 (Group 내부에서의 상대좌표)
  const tableX = personSize + spacing;
  const tableY = personSize + spacing;

  return (
    <Group x={groupX} y={groupY}>
      {/* 위쪽 사람 3명 */}
      <PersonIcon x={tableX} y={0} color={chairColor} />
      <PersonIcon x={tableX + tableWidth / 2} y={0} color={chairColor} />
      <PersonIcon x={tableX + tableWidth} y={0} color={chairColor} />

      {/* 아래쪽 사람 3명 */}
      <PersonIcon
        x={tableX}
        y={tableY + tableHeight + personSize}
        color={chairColor}
      />
      <PersonIcon
        x={tableX + tableWidth / 2}
        y={tableY + tableHeight + personSize}
        color={chairColor}
      />
      <PersonIcon
        x={tableX + tableWidth}
        y={tableY + tableHeight + personSize}
        color={chairColor}
      />

      {/* 좌측 사람 */}
      <PersonIcon x={0} y={tableY + tableHeight / 2 - 2} color={chairColor} />

      {/* 우측 사람 */}
      <PersonIcon
        x={tableX + tableWidth + spacing + personSize}
        y={tableY + tableHeight / 2 - 2}
        color={chairColor}
      />

      {/* 테이블 */}
      <Rect
        x={tableX}
        y={tableY}
        width={tableWidth}
        height={tableHeight}
        fill={chairColor}
        cornerRadius={4}
      />
    </Group>
  );
};

export default RoomFurniture;
