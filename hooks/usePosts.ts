import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

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
        const response = await axios.post(
          `${process.env.BASE_URL}/${path}`,
          postData
        );
        return response.data;
      },
      onSuccess: onSuccess,
      onError: onError,
    });

  return { isError, isPending, isPaused, isSuccess, mutate, mutateAsync };
};

export { usePosts };
