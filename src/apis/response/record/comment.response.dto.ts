import ResponseDto from '../Response.dto';
import CommentItem from './../../../types/interface/comment-item.interface';


//          interface: 댓글 조회 DTO     <완>     //
export default interface GetCommentResponseDto extends ResponseDto {
  data: {
    content: CommentItem[]; // 게시물 리스트
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

//          interface: 댓글 수정 DTO          //
export default interface PutCommentResponseDto extends ResponseDto {
  content: CommentItem[];
}
//          interface: 댓글 삭제 DTO          //
export default interface DeleteCommentResponseDto extends ResponseDto {
}
