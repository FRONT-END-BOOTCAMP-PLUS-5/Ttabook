'use client';
import Button from '@/ds/components/atoms/button/Button';
import Header from '@/ds/components/molecules/header/Header';
import { useRouter } from 'next/navigation';

interface LoggedInHeaderProps {
  onLogout: () => void;
}

const LoggedInHeader = ({ onLogout }: LoggedInHeaderProps) => {
  const router = useRouter();

  const handleClickMypage = () => {
    router.push('/mypage');
  };

  return (
    <Header>
      <Button variant="outline" size="sm" onClick={handleClickMypage}>
        마이페이지
      </Button>
      <Button variant="primary" size="sm" onClick={onLogout}>
        로그아웃
      </Button>
    </Header>
  );
};

export default LoggedInHeader;
