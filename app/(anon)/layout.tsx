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
  const { isAuthenticated } = useSession();
  const { isModalOpen, openModal, closeModal } = useModalStore();

  return (
    // 150px = footer + 80px = header
    <div style={{ position: 'relative', height: 'calc(100vh - 230px)' }}>
      {isModalOpen('signin') && (
        <SigninModal
          onClose={() => closeModal('signin')}
          openSignup={() => openModal('signup')}
        />
      )}
      {isModalOpen('signup') && (
        <SignupModal onClose={() => closeModal('signup')} />
      )}
      {isAuthenticated ? (
        <LoggedInHeader />
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
