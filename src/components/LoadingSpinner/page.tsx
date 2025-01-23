import React, { useEffect, useState } from 'react';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Loading{dots}</p>
    </div>
  );
}
