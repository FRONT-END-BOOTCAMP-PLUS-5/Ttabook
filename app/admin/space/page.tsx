'use client';

import React from 'react';
import EditRoomPage from './components/EditRoomPage';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Space } from './components/types';

const SpacePage: React.FC = () => {
  const getSpace = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/spaces/150`
    );

    const space = res.data;
    return space;
  };

  const { data, isLoading, error } = useQuery<Space>({
    queryKey: ['spaces'],
    queryFn: getSpace,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading space data</div>;
  }

  return (
    <EditRoomPage
      spaceId={data?.spaceId}
      initialRooms={data?.roomInfo}
      spaceName={data?.spaceName}
    />
  );
};

export default SpacePage;
