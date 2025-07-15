'use client';

import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import styles from './EditRoomPage.module.css';
import Canvas from './Canvas';
import { Room } from './types';
import { RoomDto } from '@/backend/admin/spaces/dtos/PostRoomQueryDto';

const EditRoomPage: React.FC = () => {
  const [adminName] = useState<string>('멋쟁이 사자');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPos, setEditingPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

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
      id: Date.now().toString(),
      positionX: dropX,
      positionY: dropY,
      width: 120,
      height: 100,
      name: '',
      detail: '',
    };

    setRooms((prev) => [...prev, newRoom]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRectClick = (room: Room) => {
    setSelectedId(room.id);
  };

  const handleDragEnd = (id: string, positionX: number, positionY: number) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, positionX, positionY } : room
      )
    );
  };

  const handleTransformEnd = (room: Room, node: Konva.Rect) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedRoom: Room = {
      ...room,
      positionX: node.x(),
      positionY: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
    };

    node.scaleX(1);
    node.scaleY(1);

    setRooms((prev) => prev.map((r) => (r.id === room.id ? updatedRoom : r)));
  };

  const handleDelete = (room: Room) => {
    if (room.id) {
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      setSelectedId(null);

      // Transformer 초기화
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  };

  const handleEditStart = (room: Room) => {
    setEditingId(room.id);
    setEditingPos({ x: room.positionX, y: room.positionY });
  };

  // To do: 백엔드 변경으로 수정 필요
  const handleSave = async () => {
    const roomDtos: RoomDto[] = rooms.map(
      (room) =>
        new RoomDto(
          room.id, // supplyId
          room.name ?? '',
          room.detail ?? '',
          room.positionX,
          room.positionY,
          1, // scaleX
          1 // scaleY
        )
    );

    try {
      const response = await fetch('/api/admin/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'temp-token',
        },
        body: JSON.stringify({ spaceName: adminName, rooms: roomDtos }),
      });

      if (response.ok) {
        alert('저장되었습니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving rooms:', error);
      alert('저장 중 오류가 발생했습니다.');
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

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <div>
          <h2 className={styles.title}>{adminName}의 공간 설정하기</h2>
          {/* <p>방을 생성하고 이름과 설명을 추가하세요.</p>
        <p>방을 클릭하여 이동하거나 크기를 조절할 수 있습니다.</p>
        <p>방을 더블 클릭하여 이름과 설명을 편집할 수 있습니다.</p>
        <p>방을 선택한 후 삭제 버튼을 클릭하여 방을 삭제할 수 있습니다.</p>
        <p>방을 드래그하여 캔버스에 추가할 수 있습니다</p> */}
        </div>

        <Canvas
          rooms={rooms}
          setRooms={setRooms}
          setSelectedId={setSelectedId}
          editingId={editingId}
          setEditingId={setEditingId}
          editingPos={editingPos}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleRectClick={handleRectClick}
          handleDragEnd={handleDragEnd}
          handleTransformEnd={handleTransformEnd}
          handleDelete={handleDelete}
          handleEditStart={handleEditStart}
          stageRef={stageRef}
          transformerRef={transformerRef}
        />

        {/* 생성 버튼 */}
        <div
          draggable
          onDragStart={handleDragStart}
          className={styles.newRoomButton}
        >
          + Room
        </div>
      </div>
      <div>
        <button className={styles.saveButton} onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default EditRoomPage;