import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = '/api';

interface PostProps {
  onSuccess: (data?: unknown) => void;
  onError: (err?: unknown) => void;
}

const usePosts = ({ onSuccess, onError }: PostProps) => {
  const { isError, isPending, isPaused, isSuccess, mutate, mutateAsync } =
    useMutation({
      mutationFn: async ({
        postData,
        path,
      }: {
        postData?: unknown;
        path: string;
      }) => {
        const response = await axios.post(`${BASE_URL}/${path}`, postData);
        return response.data;
      },
      onSuccess: onSuccess,
      onError: onError,
    });

  return { isError, isPending, isPaused, isSuccess, mutate, mutateAsync };
};

export { usePosts };
