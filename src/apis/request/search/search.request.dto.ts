
export type RecordType = 'FLOE' | 'ISSUE';

//          interface: 게시물 검색 DTO          //
export default interface SearchRecordRequestDto {
    title: string | null; // 검색할 제목 
    recordType?: RecordType; // 검색할 기록 타입 
    tagNames?: string[] | null; // 검색할 태그 목록 
}
