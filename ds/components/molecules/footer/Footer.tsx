import '../../../styles/globals.css';
import styles from './Footer.module.css';
import { FooterProps } from './Footer.types';

const Footer = ({ children }: FooterProps) => {
  return <footer className={styles.footer}>{children}</footer>;
};

export default Footer;
