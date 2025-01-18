// 'use client';
// import './globals.css';
// import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { useEffect } from 'react';
// import { useCookies } from 'react-cookie';
// import { useLoginUserStore } from '@/store/'; // zustand import
// import { getSignInUserRequest, signInRequest } from '@/apis'; // 로그인된 사용자 정보를 가져오는 API
// import { useRouter } from 'next/navigation'; // 로그인되지 않은 상태에서 리다이렉트하기 위해 사용
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// const queryClient = new QueryClient();
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { setUser, logout } = useLoginUserStore(); // zustand 상태 관리
//   const [cookies] = useCookies(); // 쿠키 상태 관리
//   const router = useRouter(); // 페이지 리다이렉트 사용
//   const clearUserStorage = useLoginUserStore.persist.clearStorage;
//   useEffect(() => {
//     if (!cookies.accessToken) {
//       logout(); // 쿠키가 없으면 로그아웃 처리
//       return;
//     }
//     getSignInUserRequest(cookies.accessToken)
//       .then((response) => {
//         if (response && response.data) {
//           // 응답에서 data를 구조 분해 할당하여 사용자 정보를 가져오기
//           const { email, nickname, profileImage, experience, age, field } =
//             response.data;
//           // 로그인 성공 후 사용자 정보 저장
//           const user = {
//             email,
//             nickname,
//             profileImage,
//             experience,
//             age,
//             field,
//           };
//           setUser(user); // zustand 상태에 사용자 정보 저장
//           console.log('login');
//         } else {
//           logout(); // 로그인 정보가 없으면 로그아웃 처리
//         }
//       })
//       .catch((error) => {
//         console.error('로그인 오류:', error);
//         logout(); // 오류가 있으면 로그아웃 처리
//         clearUserStorage();
//       });
//   }, [cookies.accessToken, setUser, logout]);

//   return (
//     <html lang="en">
//       <body>
//         <QueryClientProvider client={queryClient}>
//           {children}
//           <ReactQueryDevtools initialIsOpen={false} />
//         </QueryClientProvider>
//       </body>
//     </html>
//   );
// }
'use client';
import './globals.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from '@/store/'; // zustand import
import { getSignInUserRequest, signInRequest } from '@/apis'; // Refresh Token API 추가
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useLoginUserStore();
  const [cookies, setCookie, removeCookie] = useCookies(['accessToken', 'refreshToken']);

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
          const { email, nickname, profileImage, experience, age, field } = userResponse.data;
          setUser({ email, nickname, profileImage, experience, age, field });
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
  }, [cookies.accessToken, cookies.refreshToken, setUser, logout, setCookie, removeCookie]);

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
