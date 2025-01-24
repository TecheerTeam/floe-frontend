import { create } from 'zustand';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface AlarmState {
  isSubscribed: boolean;
  eventSource: EventSource | null;
  subscribeToAlarm: (accessToken: string) => void;
  unsubscribeFromAlarm: () => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  isSubscribed: false,
  eventSource: null,

  subscribeToAlarm: (accessToken: string) => {
    console.log('알람 구독 시작...');

    const source = new EventSourcePolyfill('http://localhost:8080/api/v1/notification/subscribe', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('새 알람:', data);
      alert(`새 알람: ${data.message}`);
    };

    source.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      source.close();
      set({ isSubscribed: false, eventSource: null });
    };

    set({ isSubscribed: true, eventSource: source });
  },

  unsubscribeFromAlarm: () => {
    console.log('알람 구독 해제...');
    set((state) => {
      state.eventSource?.close();
      return { isSubscribed: false, eventSource: null };
    });
  },
}));

export default useAlarmStore;
