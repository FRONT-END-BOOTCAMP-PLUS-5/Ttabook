'use client';
import Footer from '@/ds/components/molecules/footer/Footer';
import { useSession } from '../providers/SessionProvider';
import LoggedInHeader from '../components/LoggedInHeader';
import LoggedOutHeader from '../components/LoggedOutHeader';
import { useState } from 'react';
import SigninModal from './components/modals/signin/SigninModal';
import SignupModal from './components/modals/signup/SignupModal';

export default function AnonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout } = useSession();
  const [signinOpen, setSigninOpen] = useState<boolean>(false);
  const [signupOpen, setSignupOpen] = useState<boolean>(false);

  return (
    <div style={{ position: 'relative' }}>
      {signinOpen && <SigninModal onClose={setSigninOpen} />}
      {signupOpen && <SignupModal onClose={setSignupOpen} />}
      {user ? (
        <LoggedInHeader onLogout={logout} />
      ) : (
        <LoggedOutHeader onSignin={setSigninOpen} onSignup={setSignupOpen} />
      )}
      {children}
      <Footer />
    </div>
  );
}
