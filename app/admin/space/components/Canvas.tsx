'use client';

import React from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Transformer,
  Group,
  Label,
  Tag,
} from 'react-konva';
import Konva from 'konva';
import styles from './Canvas.module.css';
import { CanvasProps } from './types';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 700;

const Canvas: React.FC<CanvasProps> = ({
  rooms,
  setRooms,
  setSelectedId,
  editingId,
  setEditingId,
  editingPos,
  handleDrop,
  handleDragOver,
  handleRectClick,
  handleDragEnd,
  handleTransformEnd,
  handleDelete,
  handleEditStart,
  stageRef,
  transformerRef,
}) => {
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={styles.canvasContainer}
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
      }}
    >
      {/* 수정 input */}
      {editingId &&
        (() => {
          const editingRoom = rooms.find((r) => r.id === editingId);
          if (!editingRoom) return null;

          return (
            <div
              className={styles.editingForm}
              style={{
                top: editingPos.y,
                left: editingPos.x,
                width: editingRoom.width - 8,
                height: editingRoom.height - 8,
              }}
            >
              <input
                type="text"
                autoFocus
                value={editingRoom.name || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setRooms((prev) =>
                    prev.map((r) =>
                      r.id === editingId ? { ...r, name: value } : r
                    )
                  );
                }}
                placeholder="이름"
              />
              <textarea
                value={editingRoom.detail || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setRooms((prev) =>
                    prev.map((r) =>
                      r.id === editingId ? { ...r, detail: value } : r
                    )
                  );
                }}
                placeholder="상세 설명"
                className={styles.editingTextarea}
              />
              <button
                onClick={() => setEditingId(null)}
                className={styles.editingButton}
              >
                완료
              </button>
            </div>
          );
        })()}

      {/* Konva Stage */}
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
          {rooms.map((room) => (
            <Group
              key={room.id}
              id={room.id}
              x={room.positionX}
              y={room.positionY}
              width={room.width}
              height={room.height}
              draggable
              onClick={() => handleRectClick(room)}
              onDragEnd={(e) =>
                handleDragEnd(room.id, e.target.x(), e.target.y())
              }
              onTransformEnd={(e) =>
                handleTransformEnd(room, e.target as Konva.Rect)
              }
              onDblClick={() => handleEditStart(room)}
            >
              <React.Fragment key={room.id}>
                <Rect
                  x={0}
                  y={0}
                  width={room.width}
                  height={room.height}
                  fill="#B8D4A8"
                />
                <Text
                  text={
                    (room.name || '이름 입력') +
                    '\n\n' +
                    (room.detail || '상세 정보 입력')
                  }
                  x={room.width * 0.03}
                  y={room.height * 0.06}
                  width={room.width * 0.92}
                  height={room.height * 0.92}
                  fontSize={room.height * 0.1}
                  fill="black"
                  lineHeight={1.0}
                  ellipsis={true}
                  listening={false}
                />
              </React.Fragment>

              {/* 편집 버튼 */}
              <Label
                x={room.width * 0.82}
                y={room.height * 0.05}
                onClick={() => handleEditStart(room)}
              >
                <Tag fill="transparent" />
                <Text
                  text="✎"
                  fontSize={room.height * 0.09}
                  fill="black"
                  padding={0}
                />
              </Label>

              {/* 삭제 버튼 */}
              <Label
                x={room.width * 0.92}
                y={room.height * 0.05}
                onClick={() => handleDelete(room)}
              >
                <Tag fill="transparent" />
                <Text
                  text="x"
                  fontSize={room.height * 0.09}
                  fill="black"
                  padding={0}
                />
              </Label>
            </Group>
          ))}
          <Transformer
            ref={transformerRef}
            rotateEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 30 || newBox.height < 30) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;