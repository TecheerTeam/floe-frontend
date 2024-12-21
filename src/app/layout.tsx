'use client';
import './globals.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/'; // zustand import
import { signInRequest } from '@/apis'; // 로그인된 사용자 정보를 가져오는 API
import { useRouter } from 'next/navigation'; // 로그인되지 않은 상태에서 리다이렉트하기 위해 사용
import { User } from '@/types/interface'; // User 타입

const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { setUser, logout } = useLoginUserStore(); // zustand 상태 관리
  // const [cookies] = useCookies(); // 쿠키 상태 관리
  // const router = useRouter(); // 페이지 리다이렉트 사용
  // useEffect(() => {
  //   if (!cookies.accessToken) {
  //     logout(); // 쿠키가 없으면 로그아웃 처리
  //     return;
  //   }
  //    signInRequest(cookies.accessToken).then((response) => {
  //     if (response) {
  //       // 로그인 성공 후 사용자 정보 저장
  //       const user: User = {
  //         email: response.email,
  //         nickname: response.nickname,
  //         experience: response.experience,
  //         age: response.age,
  //         field: response.field,
  //         profileImage: response.profileImage,
  //       };
  //       setUser(user); // zustand 상태에 저장
  //     } else {
  //       logout(); // 로그인 정보가 없으면 로그아웃 처리
  //       router.push('/auth/login'); // 로그인 페이지로 리다이렉트
  //     }
  //   }).catch((error) => {
  //     console.error('로그인 오류:', error);
  //     logout(); // 오류가 있으면 로그아웃 처리
  //     router.push('/auth/login');
  //   });
  // }, [cookies.accessToken, setUser, logout, router]);

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
