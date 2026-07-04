# 연습실 통합 운영 — 웹 + Android

연습실 14개 방(1, 2, 3, 4, 7, 8, 9, 10, 13, 14, 15, 16, 17, S)의 계약·손익·캘린더를 관리하는 앱입니다.

| 플랫폼 | 용도 | 접속 방법 |
|--------|------|-----------|
| **웹** | PC·태블릿·안드로이드 브라우저 | GitHub Pages URL (아래) |
| **Android** | 현장 오프라인 운영 (네이티브 앱) | APK 설치 (`StudioManager/`) |

## 웹 접속 (PC 브라우저)

배포 후 아래 주소에서 바로 사용할 수 있습니다.

**https://pooloon.github.io/vibeCD/**

- Chrome, Edge, Safari 등 일반 브라우저에서 동작
- 데이터는 브라우저 **IndexedDB**에 저장 (서버 전송 없음)
- 안드로이드 Chrome에서도 동일 URL 접속 + **홈 화면에 추가** 가능 (PWA)

## 로컬 개발 (웹)

```bash
npm install
npm run dev
```

PC: `http://localhost:5173`

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드·배포합니다.

1. 저장소 **Settings → Pages → Build and deployment**
2. Source: **GitHub Actions** 선택
3. `main`에 push 후 Actions 탭에서 `Deploy Web App to GitHub Pages` 확인

수동 빌드 (GitHub Pages와 동일 경로):

```bash
BASE_PATH=/vibeCD/ npm run build
```

## Android 앱 (`StudioManager/`)

네이티브 Kotlin + Jetpack Compose + Room 앱입니다.

```bash
cd StudioManager
./gradlew assembleDebug
```

APK: `StudioManager/app/build/outputs/apk/debug/app-debug.apk`

자세한 내용은 [StudioManager/README.md](StudioManager/README.md) 참고.

## 주요 기능 (웹)

- **방 현황**: 14개 방 입주/공실
- **계약서 등록**: 월세 미실현 수익 자동 생성
- **캘린더 대시보드**: 일별 수익·지출
- **수입·지출 관리**: 실현/미실현 전환
- **합계**: 월별 손익 요약
- **백업/복원**: JSON 파일

## 기술 스택

| 웹 | Android |
|----|---------|
| React + TypeScript + Vite | Kotlin + Jetpack Compose |
| Dexie (IndexedDB) | Room (SQLite) |
| PWA | 로컬 APK |

## 데이터 주의

웹(브라우저)과 Android 앱의 데이터는 **별도 저장소**입니다. 기기 간 이동은 JSON 백업/복원을 사용하세요.
