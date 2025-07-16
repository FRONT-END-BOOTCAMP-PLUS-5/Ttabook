'use client';
import Button from '@/ds/components/atoms/button/Button';
import Header from '@/ds/components/molecules/header/Header';

interface LoggedOutHeaderProps {
  onSignin: (toggle: boolean) => void;
  onSignup: (toggle: boolean) => void;
}
const LoggedOutHeader = ({ onSignin, onSignup }: LoggedOutHeaderProps) => {
  const handleClickSignin = () => {
    onSignin(true);
  };

  const handleClickSignup = () => {
    onSignup(true);
  };
  return (
    <Header>
      <Button variant="outline" size="sm" onClick={handleClickSignin}>
        로그인
      </Button>
      <Button variant="primary" size="sm" onClick={handleClickSignup}>
        회원가입
      </Button>
    </Header>
  );
};

export default LoggedOutHeader;
