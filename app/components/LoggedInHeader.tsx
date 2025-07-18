'use client';
import Button from '@/ds/components/atoms/button/Button';
import Header from '@/ds/components/molecules/header/Header';
import { usePosts } from '@/hooks/usePosts';
// import from '../'
import { useRouter } from 'next/navigation';
import { useSession } from '../providers/SessionProvider';

const LoggedInHeader = () => {
  const onSuccess = () => {
    logout();
  };
  const onError = () => {};
  const { mutate } = usePosts({ onSuccess, onError });
  const router = useRouter();
  const { logout } = useSession();

  const handleClickMypage = () => {
    router.push('/mypage');
  };

  const handleClickLogout = () => {
    mutate({
      path: '/logout',
    });
  };

  return (
    <Header>
      <Button variant="outline" size="sm" onClick={handleClickMypage}>
        마이페이지
      </Button>
      <Button variant="primary" size="sm" onClick={handleClickLogout}>
        로그아웃
      </Button>
    </Header>
  );
};

export default LoggedInHeader;
