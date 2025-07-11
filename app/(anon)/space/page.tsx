'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva';
import Konva from 'konva';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 700;

type Room = {
  id: number; // 백엔드 Room 엔티티에 맞춰 number로 변경
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number; // 백엔드 Room 엔티티의 scaleX에 매핑
  scaleY: number; // 백엔드 Room 엔티티의 scaleY에 매핑
  name?: string;
  description?: string;
};

const CreateRoomCanvas: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingPos, setEditingPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'new-rect');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!stageRef.current) return;
    const stage = stageRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();

    const dropX = e.clientX - stageBox.left;
    const dropY = e.clientY - stageBox.top;

    const newRoom: Room = {
      id: Date.now(), // number로 변경
      x: dropX,
      y: dropY,
      width: 120,
      height: 100,
      scaleX: 1, // 초기값 추가
      scaleY: 1, // 초기값 추가
      name: '',
      description: '',
    };

    setRooms((prev) => [...prev, newRoom]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRectClick = (room: Room) => {
    setSelectedId(room.id);
    setSelectedPosition({ x: room.x, y: room.y });
  };

  const handleDragEnd = (id: number, x: number, y: number) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...room, x, y } : room))
    );

    if (id === selectedId) {
      setSelectedPosition({ x, y });
    }
  };

  const handleTransformEnd = (room: Room, node: Konva.Rect) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedRoom: Room = {
      ...room,
      x: node.x(),
      y: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      scaleX: scaleX, // scaleX 저장
      scaleY: scaleY, // scaleY 저장
    };

    node.scaleX(1);
    node.scaleY(1);

    setRooms((prev) => prev.map((r) => (r.id === room.id ? updatedRoom : r)));

    if (room.id === selectedId) {
      setSelectedPosition({ x: updatedRoom.x, y: updatedRoom.y });
    }
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current?.getStage();
    if (!transformer || !stage) return;

    if (selectedId && !editingId) {
      const groupNode = stage.findOne(`#${selectedId}`);
      if (groupNode) {
        transformer.nodes([groupNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
    }
  }, [selectedId, editingId, rooms]);

  const handleDelete = () => {
    if (selectedId) {
      // 삭제
      setRooms((prev) => prev.filter((r) => r.id !== selectedId));
      setSelectedId(null);
      setSelectedPosition(null);

      // Transformer 초기화
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  };

  const handleSave = async () => {
    // 백엔드 Room 엔티티에 맞게 데이터 변환
    const roomsToSave = rooms.map((room) => ({
      id: room.id,
      // supplyId, roomItemId, spaceId는 백엔드에서 처리
      name: room.name || '',
      detail: room.description || null, // description을 detail로 매핑
      positionX: room.x,
      positionY: room.y,
      scaleX: room.scaleX || 1,
      scaleY: room.scaleY || 1,
    }));

    console.log('저장할 Rooms 데이터 (변환 후):', roomsToSave);

    try {
      const response = await fetch('/api/space/save-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rooms: roomsToSave }), // 변환된 데이터 전송
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('저장 성공:', result);
      alert('레이아웃이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('레이아웃 저장 실패:', error);
      alert('레이아웃 저장에 실패했습니다.');
    }
  };

  const handleEditStart = (room: Room) => {
    setEditingId(room.id);
    setEditingPos({ x: room.x + 10, y: room.y + 10 });
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* 생성 버튼 */}
      <div
        draggable
        onDragStart={handleDragStart}
        style={{
          width: 120,
          height: 100,
          backgroundColor: 'lightblue',
          border: '2px solid #0077cc',
          borderRadius: 4,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
      >
        + 생성
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        style={{
          width: 120,
          height: 40,
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          userSelect: 'none',
          alignSelf: 'flex-start', // 생성 버튼과 같은 높이에 정렬
        }}
      >
        저장
      </button>

      {/* Canvas + 삭제버튼 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          position: 'relative',
          border: '2px dashed #ccc',
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
        }}
      >
        {/* 삭제 버튼 (선택된 Rect가 있을 때만 표시) */}
        {selectedPosition && (
          <div
            style={{
              position: 'absolute',
              top: selectedPosition.y - 10,
              left: selectedPosition.x + 120 - 10,
              zIndex: 10, // 캔버스 위로 올라오게
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'red',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}

        {rooms.map((room) => (
          <div
            key={`edit-btn-${room.id}`}
            style={{
              position: 'absolute',
              top: room.y + 5,
              left: room.x + room.width - 18,
              zIndex: 15,
            }}
          >
            <button
              onClick={() => handleEditStart(room)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#333',
                padding: 0,
              }}
              title="편집"
            >
              ✎
            </button>
          </div>
        ))}

        {/* 수정 input */}
        {editingId && (
          <div
            style={{
              position: 'absolute',
              top: editingPos.y,
              left: editingPos.x,
              zIndex: 20,
              background: 'white',
              padding: 4,
              border: '1px solid #aaa',
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              width: 140,
            }}
          >
            <input
              type="text"
              autoFocus
              value={rooms.find((r) => r.id === editingId)?.name || ''}
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
              rows={3}
              value={rooms.find((r) => r.id === editingId)?.description || ''}
              onChange={(e) => {
                const value = e.target.value;
                setRooms((prev) =>
                  prev.map((r) =>
                    r.id === editingId ? { ...r, description: value } : r
                  )
                );
              }}
              placeholder="상세 설명"
            />
            <button
              onClick={() => setEditingId(null)}
              style={{ alignSelf: 'flex-end' }}
            >
              완료
            </button>
          </div>
        )}

        {/* Konva Stage */}
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
          <Layer>
            {rooms.map((room) => (
              <Group
                key={room.id}
                id={room.id.toString()}
                x={room.x}
                y={room.y}
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
                    fill="lightblue"
                  />
                  <Text
                    text={
                      (room.name || '이름 없음') +
                      '\n' +
                      (room.description || '')
                    }
                    x={5}
                    y={5}
                    width={room.width - 10}
                    height={room.height - 10}
                    fontSize={14}
                    fill="black"
                    lineHeight={1.2}
                    ellipsis={true}
                    listening={false}
                  />
                </React.Fragment>
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
    </div>
  );
};

export default CreateRoomCanvas;
