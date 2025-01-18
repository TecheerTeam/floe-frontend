// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { User } from '@/types/interface'; // User 인터페이스 임포트

// interface LoginUserStore {
//   user: User | null;
//   setUser: (user: User) => void;
//   logout: () => void;
// }

// const useLoginUserStore = create<LoginUserStore>()(
//   persist(
//     (set) => ({
//       user: null,
//       setUser: (user) => set(() => ({ user })),
//       logout: () => set(() => ({ user: null })),
//     }),
//     {
//       name: 'user-storage', // localStorage에 저장

//     }
//   )
// );

// export default useLoginUserStore;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/interface'; // User 인터페이스 임포트

interface LoginUserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useLoginUserStore = create(
  persist<LoginUserStore>(
    (set, get) => ({
      user: null,
      setUser: (user) => set(() => ({ user })),
      logout: () => set(() => ({ user: null })),
    }),
    {
      name: 'user-storage', // localStorage에 저장
    }
  )
);

export default useLoginUserStore;
