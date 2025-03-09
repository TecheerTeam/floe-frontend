'use client';
import './globals.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/'; // zustand import
import { getSignInUserRequest, signInRequest } from '@/apis'; // Refresh Token API 추가

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, logout } = useLoginUserStore();
  const [cookies, setCookie, removeCookie] = useCookies([
    'accessToken',
    'refreshToken',
  ]);

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (!cookies.accessToken) {
          // Access Token이 없을 경우 Refresh Token을 사용해 Access Token 재발급 시도
          if (cookies.refreshToken) {
            console.log('Attempting to refresh access token...');
            const refreshResponse = await signInRequest(cookies.refreshToken); // Refresh API 호출
            const { accessToken, expirationTime } = refreshResponse.data;

            // 새로운 Access Token 쿠키에 저장
            const expires = new Date(Date.now() + expirationTime * 1000);
            setCookie('accessToken', accessToken, { expires, path: '/' });

            console.log('Access token refreshed successfully');
          } else {
            logout(); // Refresh Token도 없으면 로그아웃 처리
            console.warn('No tokens available. Logging out...');
            return;
          }
        }

        // Access Token이 유효한 경우 사용자 데이터 가져오기
        const userResponse = await getSignInUserRequest(cookies.accessToken);
        if (userResponse?.data) {
          const {
            email,
            nickname,
            profileImage,
            experience,
            age,
            field,
            userId,
          } = userResponse.data;
          setUser({
            email,
            nickname,
            profileImage,
            experience,
            age,
            field,
            userId,
          });
          console.log('User authenticated successfully');
        } else {
          logout();
          console.warn('Access token invalid or expired. Logging out...');
        }
      } catch (error) {
        console.error('Error during user authentication:', error);
        logout();
        removeCookie('accessToken');
        removeCookie('refreshToken');
      }
    };

    authenticateUser();
  }, [
    cookies.accessToken,
    cookies.refreshToken,
    setUser,
    logout,
    setCookie,
    removeCookie,
  ]);

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
