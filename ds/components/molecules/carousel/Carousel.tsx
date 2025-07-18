import React, { useState } from 'react';
import styles from './Carousel.module.css';
import { CarouselProps } from './Carousel.type';

/**
 * General-purpose Carousel component. Shows one slide at a time with left/right navigation and sliding animation.
 */
const Carousel: React.FC<CarouselProps> = ({ 
  children, 
  className = '', 
  style, 
  currentIndex, 
  onIndexChange 
}) => {
  const [internalCurrent, setInternalCurrent] = useState(0);
  const total = React.Children.count(children);
  
  const current = currentIndex !== undefined ? currentIndex : internalCurrent;
  
  const goLeft = () => {
    const newIndex = current === 0 ? total - 1 : current - 1;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalCurrent(newIndex);
    }
  };
  
  const goRight = () => {
    const newIndex = current === total - 1 ? 0 : current + 1;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalCurrent(newIndex);
    }
  };

  return (
    <div
      className={`${styles.carouselRoot} ${className}`}
      style={style}
    >
      {/* Left Chevron */}
      <button
        aria-label="Previous slide"
        onClick={goLeft}
        className={styles.chevronButton}
      >
        <svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.5">
            <path d="M30.5 36L18.5 24L30.5 12" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </button>

      {/* Slides Row with Animation */}
      <div className={styles.slideContainer}>
        <div
          className={styles.slidesRow}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {React.Children.map(children, (child, idx) => (
            <div className={styles.slide} key={idx}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Right Chevron */}
      <button
        aria-label="Next slide"
        onClick={goRight}
        className={styles.chevronButton}
      >
        <svg width="49" height="48" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.5" d="M18.5 36L30.5 24L18.5 12" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default Carousel; 