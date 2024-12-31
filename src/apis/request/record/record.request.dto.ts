export type RecordType = 'FLOE' | 'ISSUE';

//          interface: 게시물 기록 생성 DTO  <완>        //
export default interface PostRecordRequestDto {
    title: string;
    content: string;
    recordType: RecordType;
    tagNames: string[];
}

//          interface: 게시물 수정 DTO    <완>      //
export default interface PutRecordRequestDto {
    title: string;
    content: string;
    tagNames: string[];
    medias: { mediaId: number; mediaUrl: string }[];
}

//          interface: 댓글 생성 DTO          //
export default interface PostCommentRequestDto {
    recordId: number;
    content: string;
    parentCommentId?: number | null; // 대댓글인 경우 부모 댓글 ID (없으면 null)
}

//          interface: 댓글 수정 DTO          //
export default interface PutCommentRequestDto {
    content: string;
}