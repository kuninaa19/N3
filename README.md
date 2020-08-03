## [호텔예약사이트](https://hotelbooking.kro.kr)      
에어비앤비를 기반으로 다른 호텔사이트를 모방해서 만든사이트 입니다.  

프로젝트 목표는 다양한 외부 API를 사용해 보기 그리고 자바스크립트 비동기 제어에 대해 이해하기였습니다.


<br/> <br/>

## 프로젝트 정보   
개발 인원 : 1인 개발            

개발 기간 : 2020.05~2020.07 (리팩토링 및 지속적인 코드 개선 예정입니다.)   

Front-end : HTML/CSS, JS ES6

Back-end : Node.js, Nginx, Redis(AWS elastiCache), Mysql(AWS RDS)   

Framework : Express   

Envrironment : AWS EC2, Amazon Linux

<br/> <br/>

## 기능   
 1. 네이버와 카카오 로그인과 자체 로그인
 2. 채팅 그리고 파파고 API를 사용한 언어감지와 번역   
 3. 카카오 페이 API를 사용한 더미 결제 와 결제 취소  
 4. 호텔위치 표시를 위한 구글지도 API 마커 사용   
 5. 리뷰 작성/ 조회   

<br/><br/>

## 기술
1. Promise 객체와 Async/Await를 사용한 비동기처리 코드개선   
2. Nginx 리버스 프록시 서버 구축과 로드 밸런싱을 통한 서버 분산(추후 성능 부하테스트할 예정)   
3. 달력을 제외한 순수 JS ES6로 구성   
4. Let's Encrypt SSL 인증서를 사용한 HTTPS 설정   
5. 액세스토큰, JWT토큰 그리고 리프레시토큰을 사용한 사용자 인증 구현   

<br/> <br/>

## 이미지 설명   
<h4> 1. Passport 모듈을 활용한 소셜로그인과 자체로그인</h4>   
<br/>
<img src="https://user-images.githubusercontent.com/59405784/88654769-c8fa1e80-d108-11ea-88d1-f5f965325943.JPG" title="로그인 모달" alt="로그인"></img>   

- 소셜 로그인(카카오, 네이버)   
발급받은 액세스토큰은 2시간 만료로 쿠키에 리프레시토큰은 2달만료로 Redis 세션에 저장합니다.   

- 자체로그인   
DB에 저장되는 비밀번호는 BCrypt 모듈을 사용해서 암호화 합니다.   
발급 받은 JWT토큰을 쿠키에 저장하고 랜덤토큰을 이용해서 리프레시 토큰을 세션에 저장합니다.   

내정보같이 개인정인 정보나 결제페이지 접근할때 토큰을 확인합니다.   
토큰이 없다면 리프레시 토큰을 사용해서 재발급받도록 했습니다.   

<br/><br/>

<h4>2. 카카오 페이 API 결제 및 결제 취소</h4>
<br/>

<img src="https://user-images.githubusercontent.com/59405784/88659911-c6032c00-d110-11ea-91e3-8b80d8005dc0.png" title="결제 및 결제 취소" alt=""></img>   



- 카카오 페이 API 결제   
XMLHttpRequest객체로로 AJAX 데이터 JSON 전송  
서버에서 헤더와 폼들을 request 모듈로 카카오 요청 결제 준비요청 완료시 제공되는 URL을 프론트로 전송   
프론트에서 카카오측에서 전달한 URL을 팝업창으로 띄움   
사용자 결제승인완료시 결제페이지에서 작성했던 호스트에게 전달하는 메시지 DB저장하고 숙소정보 DB저장   

- 카카오페이 API 결제취소   
숙박하는 날짜가 이미 지난게 아니라면 결제승인했을때 카카오로 부터 받은 결제정보들을 전송해서 결제 취소   

<br/><br/>

<h4>3. 파파고 API 언어감지와 언어번역 </h4>   
<br/>
<img src="https://user-images.githubusercontent.com/59405784/88659908-c4d1ff00-d110-11ea-8cbc-3528618d613b.png" title="언어 감지 및 번역" alt="채팅"></img>         

- 채팅   
상대방 채팅내용에 대해서 번역버튼존재    
버튼 클릭시 언어 코드 확인후 존재시 즉시 언어번역요청하고 번역된 언어를 페이지에 보여줌      
번역이전 기존 원문은 Hidden 처리후 다시 번역버튼 눌렀을때 보여주면서 DB요청하지않도록 함   
언어코드가 존재하지않다면 언어감지요청 감지된 언어코드 DB저장 그리고 번역된 언어를 페이지에 보여줌

<br/><br/>

## 후기
라우터 내부에서 DB참조할때나 코드를 진행할때 마구잡이로 라우터안에서 진행되도록 했었는데 외부API를 요청하고 처리가 필요하게 되면서 자바스크립트 비동기 처리에 대해 자세하게 공부하게 됐습니다.   

DB 참조시 조인을 많이 쓰면서 DB 테이블, 컬럼을 세부적으로 구성한 작업의 필요성을 느끼게 됐습니다.   



