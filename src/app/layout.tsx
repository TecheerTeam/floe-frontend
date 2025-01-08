'use client';
import './globals.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/'; // zustand import
import { getSignInUserRequest, signInRequest } from '@/apis'; // 로그인된 사용자 정보를 가져오는 API
import { useRouter } from 'next/navigation'; // 로그인되지 않은 상태에서 리다이렉트하기 위해 사용
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, logout } = useLoginUserStore(); // zustand 상태 관리
  const [cookies] = useCookies(); // 쿠키 상태 관리
  const router = useRouter(); // 페이지 리다이렉트 사용
  useEffect(() => {
    if (!cookies.accessToken) {
      logout(); // 쿠키가 없으면 로그아웃 처리
      return;
    }
    getSignInUserRequest(cookies.accessToken)
      .then((response) => {
        if (response && response.data) {
          // 응답에서 data를 구조 분해 할당하여 사용자 정보를 가져오기
          const { email, nickname, profileImage, experience, age, field } =
            response.data;
          // 로그인 성공 후 사용자 정보 저장
          const user = {
            email,
            nickname,
            profileImage,
            experience,
            age,
            field,
          };
          setUser(user); // zustand 상태에 사용자 정보 저장
          console.log('login');
        } else {
          logout(); // 로그인 정보가 없으면 로그아웃 처리
        }
      })
      .catch((error) => {
        console.error('로그인 오류:', error);
        logout(); // 오류가 있으면 로그아웃 처리
      });
  }, [cookies.accessToken, setUser, logout]);

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
