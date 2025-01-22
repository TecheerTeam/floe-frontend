export default interface User {
    email: string; // 유저 이메일
    nickname: string; // 유저 닉네임
    experience: number | null;
    age: number | null;
    field: string | null;
    profileImage: string | null; // 유저 프로필 이미지
    userId: number;
}
