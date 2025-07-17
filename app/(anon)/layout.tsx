'use client';
import Footer from '@/ds/components/molecules/footer/Footer';
import { useSession } from '../providers/SessionProvider';
import LoggedInHeader from '../components/LoggedInHeader';
import LoggedOutHeader from '../components/LoggedOutHeader';
import SigninModal from './components/modals/signin/SigninModal';
import SignupModal from './components/modals/signup/SignupModal';
import { useModalStore } from '@/hooks/useModal';

export default function AnonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, logout } = useSession();
  const { isModalOpen, openModal, closeModal } = useModalStore();

  console.log(isAuthenticated);
  return (
    <div style={{ position: 'relative' }}>
      {isModalOpen('signin') && (
        <SigninModal onClose={() => closeModal('signin')} />
      )}
      {isModalOpen('signup') && (
        <SignupModal onClose={() => closeModal('signup')} />
      )}
      {isAuthenticated ? (
        <LoggedInHeader onLogout={logout} />
      ) : (
        <LoggedOutHeader
          onSignin={() => openModal('signin')}
          onSignup={() => openModal('signup')}
        />
      )}
      {children}
      <Footer />
    </div>
  );
}
