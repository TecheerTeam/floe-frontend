'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Google.Callback.module.css';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code'); 

    if (code) {
      console.log('Google Authorization Code:', code);

      router.push('/')
    } else {
      console.error('Authorization Code가 없습니다.');
    }
  }, []);

  return (
    <div className={styles['google-loading']}>
      Google 로그인 처리 중...
    </div>
  );
}