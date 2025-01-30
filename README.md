# Packet Viewer

임베디드 디바이스의 패킷 데이터를 분석하기 위한 데스크톱 애플리케이션입니다.

## 기능
- 덤프 파일과 tail 파일 로드
- IP별 큐 데이터 시각화
- 패킷 데이터 16진수 표시
- Tail 포인터 위치 표시

## 메모리 구조
- 10개의 IP
- 각 IP마다 4개의 큐 (8B, 16B, 32B, 64B)
- 각 큐는 256개 크기의 circular queue

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 테스트 데이터 생성
node scripts/generate_test_data.js

# 애플리케이션 실행
npm start
```
