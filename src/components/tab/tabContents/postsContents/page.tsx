'use client';

import React, { useEffect, useState } from 'react';
import styles from './Posts.Contents.module.css';
import { useCookies } from 'react-cookie';
import PostItemListType from '@/components/post/postItemListType/page';
import { getUserRecordRequest } from '@/apis';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { RecordListItem } from '@/types/interface';
import { useInView } from 'react-intersection-observer';
import { GetUserRecordResponseDto } from '@/apis/response/record/record.response.dto';

//     component: 유저 게시글 보여주기 탭 컴포넌트     //
export default function PostsContents() {
  //        state: cookie 상태        //
  const [cookies] = useCookies();
  //        state: 게시글 리스트 상태        //
  const [records, setRecords] = useState<RecordListItem[]>([]);
  //        state: 현재 페이지 번호        //
  const [currentPage, setCurrentPage] = useState<number>(0);
  //        state: 총 페이지 수        //
  const [totalPages, setTotalPages] = useState<number>(1);
  //        state: 로딩 상태        //
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fetchRecords = async (page: number) => {
    setIsLoading(true);
    try {
      const response: GetUserRecordResponseDto = await getUserRecordRequest(
        page,
        5,
        cookies.accessToken,
      );
      setRecords(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.pageable.pageNumber);
    } catch (error) {
      console.error('Error fetching user records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //      function: 페이지 클릭 핸들러      //
  const handlePageClick = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  //          effect: 스크롤 감지해서 다음 페이지로 넘기기(무한 스크롤)          //
  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);
  //     render: 사용자 게시물 렌더링    //
  return (
    <div className={styles['postContentWrapper']}>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {records.length > 0 ? (
            records.map((recordListItem) => (
              <PostItemListType
                key={recordListItem.recordId}
                recordListItem={recordListItem}
              />
            ))
          ) : (
            <p>No records found.</p>
          )}
        </>
      )}
      <div className={styles['paginationWrapper']}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={
              index === currentPage
                ? styles['paginationButtonActive']
                : styles['paginationButton']
            }
            onClick={() => handlePageClick(index)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
