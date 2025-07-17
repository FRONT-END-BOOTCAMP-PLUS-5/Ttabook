'use client';

import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import styles from './EditRoomPage.module.css';
import Canvas from './Canvas';
import { Room } from './types';

interface EditRoomPageProps {
  spaceId?: number;
  initialRooms?: Room[];
  spaceName?: string;
}

const EditRoomPage: React.FC<EditRoomPageProps> = ({
  spaceId,
  initialRooms = [],
  spaceName = '멋쟁이 사자',
}) => {
  const [adminName, setAdminName] = useState<string>(spaceName);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
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
        room.id.toString() === id ? { ...room, positionX, positionY } : room
      )
    );
  };

  const handleTransformEnd = (room: Room, node: Konva.Rect) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedRoom: Room = {
      // 배열이여야 함. 수정필요.
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

  const spaceSave = async () => {
    const newRooms = rooms.filter((room) => typeof room.id === 'string');
    const updatedRooms = rooms.filter((room) => typeof room.id === 'number');

    try {
      let currentSpaceId = spaceId;
      // space에 room이 없다면, POST하여 새로운 공간을 생성
      if (!currentSpaceId) {
        const spaceResponse = await fetch('/api/admin/spaces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'temp-token',
          },
          body: JSON.stringify({
            spaceName: adminName,
            rooms: newRooms.map((room) => ({
              name: room.name ?? '',
              detail: room.detail ?? '',
              positionX: room.positionX,
              positionY: room.positionY,
              width: room.width,
              height: room.height,
            })),
          }),
        });
        if (!spaceResponse.ok) {
          throw new Error('Failed to create space');
        }
        const spaceData = await spaceResponse.json();
        currentSpaceId = spaceData.spaceId; // Assuming the response contains spaceId
      } else if (currentSpaceId) {
        // await fetch(`/api/admin/spaces/${currentSpaceId}`, {
        // method: 'PUT',
        // headers: {
        //   'Content-Type': 'application/json',
        //   Authorization: 'temp-token',
        // },
        // body: JSON.stringify({}),
        // });

        // Handle new, updated, and deleted rooms for an existing space
        // if (newRooms.length > 0) {
        //   await fetch(`/api/admin/spaces/${currentSpaceId}`, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: 'temp-token',
        //     },
        //     body: JSON.stringify({
        //       rooms: newRooms.map((room) => ({
        //         name: room.name ?? '',
        //         detail: room.detail ?? '',
        //         positionX: room.positionX,
        //         positionY: room.positionY,
        //         width: room.width,
        //         height: room.height,
        //       })),
        //     }),
        //   });
        // }

        if (updatedRooms.length > 0) {
          await fetch(`/api/admin/spaces/${currentSpaceId}`, {
            // space에 room이 있다면, PUT 요청으로 공간을 업데이트
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'temp-token',
            },
            body: JSON.stringify({
              // spaceName: adminName,
              rooms: updatedRooms.map((room) => ({
                roomId: room.id,
                name: room.name ?? '',
                detail: room.detail ?? '',
                positionX: room.positionX,
                positionY: room.positionY,
                width: room.width,
                height: room.height,
              })),
            }),
          });
        }
      }

      alert('저장되었습니다.');
    } catch {
      console.error('Error saving rooms:');
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current?.getStage();
    if (!transformer || !stage) return;

    if (selectedId && !editingId) {
      const groupNode = stage.findOne(`#${selectedId.toString()}`);
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
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className={styles.titleInput}
          />
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

        <div
          draggable
          onDragStart={handleDragStart}
          className={styles.newRoomButton}
        >
          + Room
        </div>
      </div>
      <div>
        <button className={styles.saveButton} onClick={spaceSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default EditRoomPage;
