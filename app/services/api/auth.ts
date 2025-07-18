export interface GetCurrentUserResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
}

export const authApiService = {
  getCurrentUser: async (): Promise<GetCurrentUserResponse> => {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
