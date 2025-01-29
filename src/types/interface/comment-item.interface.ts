export default interface CommentItem {
    commentId: number; // 댓글 ID
    user: {
        nickname: string;
        email: string;
        profileImage: string | null;
    }; // 댓글 작성자 정보
    content: string; // 댓글 내용
    parentId?: number | null; // 대댓글인 경우 부모 댓글 ID
    createdAt: string; // 생성 일시
}
