import React from 'react';
import Image from 'next/image';
import { HeaderProps } from './Header.types';
import styles from './Header.module.css';

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoWrapper}>
        <Image src={'/Logo.png'} alt="Ttabook Logo" width={117} height={28} />
      </div>
      <nav className={styles.actionsWrapper}>{children}</nav>
    </header>
  );
};

export default Header;
