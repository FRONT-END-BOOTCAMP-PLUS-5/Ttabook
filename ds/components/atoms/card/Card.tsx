import React from 'react';
import styles from './Card.module.css';
import { CardProps } from './Card.type';

/**
 * Generic Card component. Highly reusable, with adjustable width, height, and background color.
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  width = 900,
  height = 280,
  background,
}) => {
  return (
    <div
      className={`${styles.cardRoot} ${className}`}
      style={{
        width,
        height,
        background: background ? background : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card; 