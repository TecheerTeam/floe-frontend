'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import axios from 'axios';

export default function GithubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(['accessToken', 'refreshToken']);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const email = searchParams.get('email');

        const response = await axios.get(
          `http://localhost:8080/api/v1/auth/oauth/token?email=${email}`,
          {},
        );

        if (response.status === 200) {
          // 응답 헤더에서 토큰 추출
          const accessToken = response.headers['authorization'];
          const refreshToken = response.headers['authorization-refresh'];
          const expirationTime = response.headers['expires'];

          if (!accessToken || !refreshToken) {
            console.error('토큰 정보가 없습니다.');
            router.push('/auth');
            return;
          }

          // 만료 시간 설정
          const now = new Date().getTime();
          const expires = new Date(now + Number(expirationTime) * 1000);

          // 쿠키에 토큰 저장
          setCookie('accessToken', accessToken, {
            expires,
            path: '/',
            secure: false,
            sameSite: 'strict',
          });

          setCookie('refreshToken', refreshToken, {
            expires,
            path: '/',
            secure: false,
            sameSite: 'strict',
          });

          // 홈페이지로 리다이렉트
          router.push('/');
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
        router.push('/auth');
      }
    };

    // state 파라미터가 있으면 토큰을 가져옴
    const state = searchParams.get('state');
    if (state === 'success') {
      fetchTokens();
    }
  }, [router, searchParams, setCookie]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
      로그인 처리 중...
    </div>
  );
}
