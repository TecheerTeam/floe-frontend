import { RecordListItem, RecordItem } from '@/types/interface';
import User from './../../../types/interface/user.interface';
import ResponseDto from '../Response.dto';
//          interface: 특정 게시물 조회 DTO          <완>//
export default interface GetDetailRecordResponseDto extends ResponseDto {
  content: RecordItem; // 게시물 상세 정보
}

//          interface: 전체(최신순) 게시물 조회 DTO        <완>  //
export default interface GetRecordResponseDto extends ResponseDto {
  data: {
    content: RecordListItem[]; // 게시물 리스트
    pageable: {
      pageNumber: number; // 현재 페이지 번호
      pageSize: number;   // 한 페이지에 포함된 요소 수
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}


//          interface: 게시물 생성 DTO       <완>   //
export default interface PostRecordResponseDto extends ResponseDto<{

}> { recordId: number; }


//          interface: 게시물 수정 DTO      <완>     //
export default interface PutRecordResponseDto extends ResponseDto {
  content: RecordItem; // RecordItem 재사용
}

//          interface: 게시물 삭제 DTO     <완>     //
export default interface DeleteRecordResponseDto extends ResponseDto {

}

export interface GetUserRecordResponseDto extends ResponseDto {
  data: {
    content: RecordListItem[]; // 게시물 리스트
    pageable: {
      pageNumber: number; // 현재 페이지 번호
      pageSize: number;   // 한 페이지에 포함된 요소 수
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export interface GetCheckSavedRecordResponseDto extends ResponseDto {
  data: {
    saved: boolean;
  }
}