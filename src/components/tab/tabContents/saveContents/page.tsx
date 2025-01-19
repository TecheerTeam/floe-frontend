'use client';

import React, { useEffect, useState } from 'react';
import styles from './Save.Contents.module.css';
import { useCookies } from 'react-cookie';
import PostItemListType from '@/components/post/postItemListType/page';
import { getSaveListRecordRequest } from '@/apis';
import { RecordListItem } from '@/types/interface';
import { GetUserRecordResponseDto } from '@/apis/response/record/record.response.dto';

//     component: 유저 저장 목록 보여주기 탭 컴포넌트     //
export default function SaveContents() {
  const [cookies] = useCookies();
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 페이지네이션 관련 상태
  const maxButtons = 10; // 한 번에 보여질 최대 페이지 버튼 수
  const [currentPageGroup, setCurrentPageGroup] = useState<number>(0); // 현재 페이지 그룹

  //      function: 데이터 가져오기      //
  const fetchSaveList = async (page: number) => {
    setIsLoading(true);
    try {
      const response: GetUserRecordResponseDto = await getSaveListRecordRequest(
        page,
        5,
        cookies.accessToken,
      );
      setRecords(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.pageable.pageNumber);
      console.log('fetch save list success in save tab', response.data);
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

  //      function: 이전 그룹으로 이동      //
  const handlePreviousGroup = () => {
    if (currentPageGroup > 0) {
      const newGroup = currentPageGroup - 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 이전 그룹의 첫 번째 페이지로 이동
    }
  };

  //      function: 다음 그룹으로 이동      //
  const handleNextGroup = () => {
    if ((currentPageGroup + 1) * maxButtons < totalPages) {
      const newGroup = currentPageGroup + 1;
      setCurrentPageGroup(newGroup);
      setCurrentPage(newGroup * maxButtons); // 다음 그룹의 첫 번째 페이지로 이동
    }
  };

  //     effect: 페이지 변경 시 데이터 가져오기     //
  useEffect(() => {
    fetchSaveList(currentPage);
  }, [currentPage]);

  //      function: 현재 그룹의 페이지 버튼 생성      //
  const renderPageButtons = () => {
    const startPage = currentPageGroup * maxButtons;
    const endPage = Math.min(startPage + maxButtons, totalPages); // 마지막 그룹에서 totalPages를 초과하지 않도록 제한

    return Array.from({ length: endPage - startPage }, (_, index) => {
      const page = startPage + index;
      return (
        <button
          key={page}
          className={
            page === currentPage
              ? styles['paginationButtonActive']
              : styles['paginationButton']
          }
          onClick={() => handlePageClick(page)}>
          {page + 1}
        </button>
      );
    });
  };
  return (
    <div className={styles['saveContentWrapper']}>
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
            <div className={styles['no-records']}>
              <p>No records found.</p>
            </div>
          )}
        </>
      )}
      <div className={styles['paginationWrapper']}>
        {currentPageGroup > 0 && (
          <button
            className={styles['paginationButton']}
            onClick={handlePreviousGroup}>
            &lt;
          </button>
        )}
        {renderPageButtons()}
        {(currentPageGroup + 1) * maxButtons < totalPages && (
          <button
            className={styles['paginationButton']}
            onClick={handleNextGroup}>
            &gt;
          </button>
        )}
      </div>
    </div>
  );
}
