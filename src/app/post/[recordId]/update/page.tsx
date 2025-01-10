'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import Placeholder from '@tiptap/extension-placeholder';
import Header from '@/app/header/page';
import NavBar from '@/app/navBar/page';
import styles from './PostUpdate.module.css';
import { useLoginUserStore, useRecordTypeStore } from '@/store';
import { useRecordStore } from '@/store';
import {
  getDetailRecordRequest,
  postRecordRequest,
  putRecordRequest,
} from '@/apis';
import { useCookies } from 'react-cookie';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PostRecordResponseDto } from '@/apis/response/record';
import { RecordItem } from '@/types/interface';

//          component: 게시물 수정 화면 컴포넌트          //
export default function PostUpdate() {
  //      state: 라우팅     //
  const router = useRouter(); // 페이지 리다이렉트 사용
  //     state: 로그인 유저 상태     //
  const { user } = useLoginUserStore(); // zustand 상태 관리
  //     state: 쿠키 상태 관리리     //
  const [cookies] = useCookies();
  //     state: 리액트 쿼리 상태     //
  const queryClient = useQueryClient();
  //     state: url params 상태    //
  const { recordId } = useParams(); // URL에서 recordId 가져오기
  //          state: 제목 영역 요소 참조 상태          //
  const titleRef = useRef<HTMLInputElement | null>(null);
  //          state: 이미지 입력 요소 참조 상태          //
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  //          state: 스택 태그 입력 요소 참조 상태          //
  const tagRef = useRef<HTMLInputElement | null>(null);

  //          state: 게시물 이미지 미리보기 URL 상태          //
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  //        state: 게시물 상태(zustand)        //
  const [record, setRecord] = useState<RecordItem | null>(null);
  //          state: content 상태          //
  const { content, setContent } = useRecordStore();
  //          state: 초기화 상태          //
  const { resetRecord } = useRecordStore();
  //          state: 카테고리 상태          //
  const { recordType, setRecordType } = useRecordTypeStore();
  //          state: Stack Tag 상태          //
  const { tagNames, setTagNames } = useRecordStore();
  //          state: title 상태          //
  const { title, setTitle } = useRecordStore();
  //          state: 이미지 상태          //
  const { images, setImages } = useRecordStore();

  //     function: recordId가 string|string[] 형식일 경우 number로 변환     //
  const id = Array.isArray(recordId) ? Number(recordId[0]) : Number(recordId);
  if (!id || isNaN(id)) {
    console.error('Invalid recordId:', recordId);
    return undefined;
  }

  //         event handler: Stack Tag 처리 이벤트          //
  const onTagChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    // value를 그대로 배열로 저장
    const tagArray = value.split(',').map((tag) => tag.trim()); // 쉼표로 구분하고 공백 제거

    // 상태 업데이트
    setTagNames(tagArray); // 배열로 업데이트
    console.log(tagArray); // 배열로 처리된 값 출력
  };

  //         event handler: 카테고리 변경 처리 이벤트          //
  const onCategoryChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = event.target.value as 'FLOE' | 'ISSUE'; // 선택한 값
    setRecordType(selectedCategory); // zustand 상태 업데이트
    console.log(selectedCategory);
  };

  //         event handler: 제목 변경 처리 이벤트          //
  const onTitleChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTitle(value);

    if (!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    console.log(value);
  };

  //          event handler: 이미지 업로드 버튼 클릭 이벤트 처리          //
  const onImageUploadButtonClickHandler = () => {
    if (!imageInputRef.current) return;
    imageInputRef.current.click();
  };

  //          event handler: 이미지 변경 이벤트 처리          //

  const onImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;
    const files = Array.from(event.target.files); // Convert FileList to array

    const newImageUrls = [...imageUrls];
    const newRecordImageFileList = [...images];

    files.forEach((file) => {
      const imageUrl = URL.createObjectURL(file); // 이미지 미리보기 URL 생성
      newImageUrls.push(imageUrl);
      newRecordImageFileList.push(file);
    });

    setImageUrls(newImageUrls); // 미리보기 URL 상태 업데이트
    setImages(newRecordImageFileList); // 서버 전송 파일 목록 상태 업데이트
  };

  //          event handler: 이미지 닫기 버튼 클릭 이벤트 처리          //
  const onImageCloseButtonClickHandler = (deleteindex: number) => {
    if (!imageInputRef.current) return;
    imageInputRef.current.value = '';

    const newImageUrls = imageUrls.filter(
      (url, index) => index !== deleteindex,
    );
    setImageUrls(newImageUrls);

    const newRecordImageFileList = images.filter(
      (url, index) => index !== deleteindex,
    );
    setImages(newRecordImageFileList);

    if (!imageInputRef.current) return;
    imageInputRef.current.value = '';
  };

  //          function: Tip-Tap Editor 함수          //
  const editor = useEditor({
    extensions: [
      StarterKit,
      Text,
      Bold,
      Italic,
      Code,
      Placeholder.configure({
        // 에디터가 완전히 비어 있을 때만 placeholder를 표시
        emptyEditorClass: 'is-empty', // 커스텀 클래스를 추가
        placeholder: '내용을 입력해주세요...', // 표시할 placeholder 내용
      }),
    ],
    content: '',
    autofocus: true,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML()); // TipTap 에디터의 HTML 내용을 상태로 저장
    },
  });

  //     effect: 에디터 컴포넌트에 현재 게시물 content 넣어주기     //
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content); // editor에 최신 content를 설정
    }
  }, [content, editor]);

  //         function: 업로드 버튼 클릭 함수          //
  const onUploadButtonClickHandler = async () => {
    const accessToken = cookies.accessToken;
    if (!accessToken) return;
    const formData = new FormData();

    // 1. 이미지 데이터를 FormData에 추가
    const updateDto = {
      title,
      content,
      recordType,
      tagNames,
      medias: images.map((image, index) => {
        if (typeof image === 'string') {
          return { mediaId: index + 1, mediaUrl: image };
        }
        return null;
      }),
    };

    const dtoBlob = new Blob([JSON.stringify(updateDto)], {
      type: 'application/json',
    });
    formData.append('updateDto', dtoBlob);
    // 이미지 파일들을 formData에 추가

    if (images.length > 0) {
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append('updateFiles', image);
        }
      });
    } else {
      const emptyBlob = new Blob([], { type: 'application/json' });
      formData.append('updateFiles', emptyBlob);
    }

    // 3. API 호출: 서버에 FormData 보내기
    try {
      const response = await putRecordRequest(id, formData, accessToken);

      if (response.code === 'R005') {
        queryClient.invalidateQueries({ queryKey: ['records'] }); // 캐시를 무효화
        router.push('/');
        console.log('게시물 수정 완료');
      }
    } catch (error) {
      console.error('Error posting record', error);
    }
  };

  //     function: 기존 게시물 데이터 불러오기 처리 함수     //
  const fetchRecordData = async () => {
    try {
      const response = await getDetailRecordRequest(id);
      if (response?.code === 'R003') {
        const { title, recordType, tagNames, content, medias } = response.data;
        setTitle(title);
        setRecordType(recordType);
        setTagNames(tagNames);
        setContent(content);
        // 이미지 처리
        if (medias && medias.length > 0) {
          const mediaUrls = medias.map(
            (media: { mediaUrl: any }) => media.mediaUrl,
          );
          setImages([]); // 서버의 이미지는 업로드에서 처리되지 않으므로 빈 상태로 유지
          setImageUrls(mediaUrls);
        } else {
          setImageUrls([]);
        }
      }
    } catch (error) {
      console.error('게시물 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (recordId) {
      fetchRecordData();
    }
  }, [recordId]);

  //          effect: 마운트 시 실행할 함수          //
  useEffect(() => {
    if (!cookies.accessToken && !user) {
      alert('로그인이 필요합니다');
      router.push('/auth');
    }
  }, [cookies.accessToken]);

  return (
    <>
      <Header />
      <div className={styles['post-update-page-Container']}>
        <aside className={styles['navbar']}>
          <NavBar />
        </aside>
        {/* Posting 영역 */}
        <div className={styles['post-Section']}>
          <div className={styles['top-Section']}>
            <div className={styles['stack-Section']}>
              <div className={styles['stack-Title-Box']}>
                <div className={styles['stack-Title-Text']}>{'📌Stack'}</div>
                <div className={styles['stack-Title-Intro-Text']}>
                  {'관련된 스택을 표시해주세요'}
                </div>
              </div>

              <div className={styles['stack-Search-Box']}>
                <input
                  className={styles['stack-Search']}
                  placeholder="Search..."
                  ref={tagRef}
                  onChange={onTagChangeHandler}
                  value={tagNames}
                />
                <div className={styles['stack-Add-Complete']}></div>
              </div>
            </div>
            {/* Category 영역 */}
            <div className={styles['category-Section']}>
              <div className={styles['category-Title-Box']}>
                <div className={styles['category-Title-Text']}>
                  {'🏷️Category'}
                </div>
                <div className={styles['category-Title-Intro-Text']}>
                  {'️글의 유형을 선택해주세요'}
                </div>
              </div>
              <div className={styles['category-Select-Box']}>
                <select
                  value={recordType}
                  onChange={onCategoryChangeHandler}
                  name="post-Category"
                  className={styles['post-Category']}>
                  <option value="Floe">{'Floe'}</option>
                  <option value="Issue">{'Issue'}</option>
                </select>
              </div>
            </div>
          </div>
          {/* Title 영역 */}
          <div className={styles['title-Section']}>
            <div className={styles['title-Title-Box']}>
              <div className={styles['title-Title-Text']}>{'Title'}</div>
              <div className={styles['title-Title-Intro-Text']}>
                {'제목을 입력해주세요'}
              </div>
            </div>
            <div className={styles['title-Input-Box']}>
              <input
                className={styles['title-Input']}
                placeholder="Enter your Title..."
                ref={titleRef}
                onChange={onTitleChangeHandler}
                value={title}
              />
            </div>
          </div>

          <div className={styles['content-Section']}>
            <div className={styles['content-Title-Box']}>
              <div className={styles['content-Title-Text']}>{'Content'}</div>
              <div className={styles['content-Title-Intro-Text']}>
                {'내용용을 입력해주세요'}
              </div>
            </div>
            <div className={styles['content-Input-Box']}>
              <div className={styles.editorContainer}>
                <div className={styles.toolbar}>
                  <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={styles.toolbarButton}>
                    <b>B</b>
                  </button>
                  <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={styles.toolbarButton}>
                    <i>I</i>
                  </button>
                  <button
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    className={styles.toolbarButton}>
                    {'<>'}
                  </button>
                </div>
                <div className={styles['divider']}></div>
                {editor && (
                  <EditorContent editor={editor} className={styles.editor} />
                )}
              </div>
            </div>
          </div>

          <div className={styles['image-Section']}>
            <div className={styles['image-Title-Box']}>
              <div className={styles['image-Title-Text']}>{'Image'}</div>
              <div className={styles['image-Title-Intro-Text']}>
                {'이미지를 첨부하세요'}
              </div>
            </div>

            <div className={styles['image-Input-Box']}>
              <div className={styles['image-Input-button-box']}>
                <div
                  className={styles['image-Input-button']}
                  onClick={onImageUploadButtonClickHandler}></div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageChangeHandler} // 이미지 선택 시 처리
                  style={{ display: 'none' }}
                />
              </div>{' '}
              <div className={styles['image-section-divider']}></div>
              <div className={styles['image-upload-section']}>
                {imageUrls.map((imageurl, index) => (
                  <div key={index} className={styles['image-preview-box']}>
                    <img
                      src={imageurl}
                      alt="preview"
                      className={styles['image']}
                    />
                    <div
                      className={styles['image-close-button']}
                      onClick={() =>
                        onImageCloseButtonClickHandler(index)
                      }></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles['upload-Section']}>
            <button
              className={styles['upload-Button']}
              onClick={onUploadButtonClickHandler}>
              Upload
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
