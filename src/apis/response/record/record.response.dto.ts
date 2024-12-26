import { RecordListItem, RecordItem } from '@/types/interface';
import ResponseDto from '../Response.dto';
//          interface: 특정 게시물 조회 DTO          <완>//
export default interface GetDetailRecordResponseDto extends ResponseDto {
    data: RecordItem; // 게시물 상세 정보
}

//          interface: 전체(최신순) 게시물 조회 DTO        <완>  //
export default interface GetRecordResponseDto extends ResponseDto {
    content: RecordListItem[]; // 게시물 리스트
    pageable: {            // 페이지 정보
        pageNumber: number; // 현재 페이지 번호
        pageSize: number;   // 한 페이지에 포함된 요소 수
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        }; // 정렬 정보
    };
    totalPages: number;        // 총 페이지 수
    totalElements: number;     // 전체 요소 수
    last: boolean;             // 마지막 페이지 여부
    first: boolean;            // 첫 페이지 여부
    numberOfElements: number;  // 현재 페이지의 요소 수
    empty: boolean;            // 데이터가 비었는지 여부
}

//          interface: 게시물 생성 DTO       <완>   //
export default interface PostRecordResponseDto extends ResponseDto<{
    
}> { recordId: number;}


//          interface: 게시물 수정 DTO      <완>     //
export default interface PutRecordResponseDto extends ResponseDto {
    data: RecordItem; // RecordItem 재사용
}

//          interface: 게시물 삭제 DTO     <완>     //
export default interface DeleteRecordResponseDto extends ResponseDto {

}
