// store/record.store.ts
import { create } from 'zustand';

interface Media {
  mediaId: number;
  mediaUrl: string;
}

interface RecordStore {
  title: string;
  content: string;
  tagNames: string[];
  images: File[];
  medias: Media[]; // 업로드된 이미지 정보
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTagNames: (tags: string[]) => void;
  setImages: (images: File[]) => void;
  setMedias: (medias: Media[]) => void;
  resetRecord: () => void; // 상태 초기화
}

const useRecordStore = create<RecordStore>((set) => ({
  title: '',
  content: '',
  tagNames: [],
  images: [],
  medias: [],
  setTitle: (title) => set(() => ({ title })),
  setContent: (content) => set(() => ({ content })),
  setTagNames: (tagNames) => set(() => ({ tagNames })),
  setImages: (images) => set(() => ({ images })),
  setMedias: (medias) => set(() => ({ medias })),
  resetRecord: () => set(() => ({ title: '', content: '', tags: [], images: [] })),
}));

export default useRecordStore;