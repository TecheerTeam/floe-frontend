export default interface SignUpRequestDto {
    email: string;
    password: string;
    nickname: string;
    experience: number | null; //연차
    age: number | null; //나이
    field: string | null;  // 분야(ex, 프론트엔드)
    profileImage: string | null; //개인정보 수집 동의
}