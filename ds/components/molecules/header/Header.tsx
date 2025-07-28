import React from 'react';
import Image from 'next/image';
import { HeaderProps } from './Header.types';
import styles from './Header.module.css';
import { useRouter } from 'next/navigation';

const Header: React.FC<HeaderProps> = ({ children }) => {
  const router = useRouter();
  const handleClickLogo = () => {
    router.push('/');
  };
  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper} onClick={handleClickLogo}>
        <picture>
          <source srcSet="/Logo.avif" type="image/avif" />
          <source srcSet="/Logo.webp" type="image/webp" />
          <Image
            src={'/Logo.png'}
            alt="Ttabook Logo"
            width={117}
            height={28}
            priority
          />
        </picture>
      </div>
      <nav className={styles.actionsWrapper}>{children}</nav>
    </header>
  );
};

export default Header;
