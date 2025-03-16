#  FLOE - 트러블 슈팅 기록 SNS
### 팀원 : 김지훈(FE), 강재훈(FE), 박진형(BE), 서지민(BE),  연경수(BE)

#### 사용 스택 : 
FrontEnd : React, TypeScript, Next.js, Chart.js, Tanstack-Query, Axios, Zustand

BackEnd : Java, Spring Boot

DB : MySQL, Redis

Deploy : Docker, AWS S3

Design : Figma

### 'npm run dev' 를 터미널에 입력해 구동합니다.
#### !! 팀 전원 연락 두절로 배포 불가 !!


### 프로젝트 소개
#### 프로젝트명 : FLOE

**개발자들의 Trouble Shooting과 질문들을 자유롭게 공유하고 게시하는 FLOE** 입니다.

개발 실력과 관계없이 개발을 하다 막히면 AI에게 물어보거나, 구글링을 하게 됩니다.  가장 유명한 TroubleShooting 사이트는 **Stack OverFlow** 일 것입니다. 하지만 **Stack OverFlow**의 대부분의 게시글은 영어로 작성되어 있으며, 번역을 하더라도 문맥이 어색한 경우가 많습니다.. FLOE는 이러한 불편함을 해소하기 위해, **국내 개발자들을 위한 TroubleShooting 플랫폼**을 기획했고, 이를 **SNS 형태로 구현**하려 합니다.


### FLOE의 의미

**FLOE**는 ‘**유빙(浮氷, 떠다니는 얼음 조각)**’이라는 뜻으로, **자유롭게 흘러다니는 빙하의 일부분**을 의미합니다.
 저희는 **StackOverFlow**의 **트러블슈팅** **기능**과, Instagram에서 만든 텍스트 중심의 SNS인 **Thread**에서 영감을 얻었습니다. 

 Threads의 사전적 의미는 “**실(Thread)**”입니다.  유저들의 게시글이 하나의 실이 되어 자유롭게 얽히고 설켜 흐름을 만들며 궁극적으로는 **SNS로서의 네트워크 효과를 형성**합니다.

마찬가지로, FLOE에서는 **트러블슈팅 경험과 질문들이 자유롭게 공유되면서 하나의 거대한 흐름을 형성**합니다.

이와 유사한 의미를 가지면서 **도메인이 등록되지 않은 네이밍을 고민**하던 중, FLOE라는 도메인이 비어 있다는 것을 발견했고, 이를 저희 서비스명으로 정하게 되었습니다.

---

### FLOE에서 제공하는 기능

- **FLOE 페이지**: 사용자는 자신의 **트러블슈팅 경험과 노하우를 기록하고 공유**할 수 있습니다.
- **ISSUE 페이지**: 특정 에러 핸들링에 대한 질문이 있을 경우, 해당 페이지에서 게시글을 작성할 수 있습니다.
- **게시글 기능 :**
    - 좋아요, 댓글 및 대댓글, 스크랩 기능을 통해 사용자 간 상호작용을 지원합니다.
    - 언제든지 다시 찾아볼 수 있는 스크랩 기능을 제공하여 개발자들이 성장할 수 있도록 돕습니다.

게시글을 작성할 때, **어떤 기술 스택과 관련된 문제인지 선택하여 포스팅**하게 됩니다.

이 스택 관련 데이터는 **DB에 누적**되며, **SideBar에서 Pie-Chart 형태로 시각화**됩니다.

이를 통해 사용자는 **트러블슈팅 현황을 한눈에 파악**할 수 있을 뿐만 아니라, **기술 트렌드 변화도 확인**할 수 있습니다.

**이는 곧 취업 트렌드와도 연결되며**, 변화하는 기술 동향을 실시간으로 파악할 수 있도록 돕습니다

ERD

<img width="798" alt="ERD" src="https://github.com/user-attachments/assets/f6cf6bb6-2ecf-4bcb-a423-d1e24a5e07d9" />


### 시연 GIF
#### Splash Screen
![spash-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/f958eb68-492d-4f41-90f4-9ad1c6efaeb1)


#### Main Page
![main-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/6078eb93-ef32-46d7-bd98-cca1f63a1956)


#### Sign-Up Page
![signup-ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/6044ed02-01ad-4eaa-a4e5-f046fc661b97)


#### Sign-In Page
![signin-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/7cf957cc-2144-4dff-9cf2-23c633ee62d5)


#### O.Auth Page
![oauth-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/5c07f0ca-c34b-48a7-b009-625a6ee69215)


#### Post-Detail Page
![ezgif com-video-to-gif-converter (1)](https://github.com/user-attachments/assets/072401d2-1cfb-4a92-95f8-d7c84da1ae94)


#### MyPage
![ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/8b2fc87d-948e-45d7-8a58-92d96000e26a)


#### Search
![ezgif com-video-to-gif-converter (2)](https://github.com/user-attachments/assets/1c5617a3-d7b8-4938-bb61-c4f57f56227b)


#### Alarm
![ezgif com-video-to-gif-converter (3)](https://github.com/user-attachments/assets/f4abf805-077d-41c5-baaa-3005a6d73b85)


#### Dark Mode
![ezgif com-video-to-gif-converter (4)](https://github.com/user-attachments/assets/41e33a11-2e11-4613-be35-fb84d3ed883a)






