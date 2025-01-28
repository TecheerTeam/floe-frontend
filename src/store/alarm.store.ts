// store/alarm.store.ts
import { create } from 'zustand';

interface Alarm {
  id: number;
  senderProfileImage: string;
  senderNickname: string;
  notificationType: 'NEW_COMMENT' | 'NEW_LIKE' | 'FOLLOW_REQUEST';
  relatedUrl: string;
  createdAt: string;
  isRead: boolean;
  isDelete: boolean;
}


interface AlarmStore {
  alarms: Alarm[];
  setAlarms: (alarms: Alarm[]) => void;
  resetAlarms: () => void;
  readAlarm: (id: number) => void; // 읽음 처리 함수
  deleteAlarm: (id: number) => void; // 알람 삭제 처리 함수
}

const useAlarmStore = create<AlarmStore>((set) => ({
  alarms: [],
  setAlarms: (alarms) => set({ alarms }),
  resetAlarms: () => set({ alarms: [] }),

  readAlarm: (id: number) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isRead: true } : alarm
      ),
    })),

  // 알람 삭제 처리 함수: 특정 알람 삭제
  deleteAlarm: (id: number) =>
    set((state) => ({
      alarms: state.alarms.filter((alarm) => alarm.id !== id),
    })),
}));

export default useAlarmStore;
