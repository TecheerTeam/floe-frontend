'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Github.Callback.module.css';

export default function GithubCallback() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code'); 

    if (code) {
      console.log('Github Authorization Code:', code);

      router.push('/')
    } else {
      console.error('Authorization Code가 없습니다.');
    }
  }, []);

  return (
    <div className={styles['github-loading']}>
      Google 로그인 처리 중...
    </div>
  );
}