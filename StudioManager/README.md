# StudioManager — 연습실 통합 운영 Android 앱

Kotlin + Jetpack Compose + Room 기반 로컬 운영 관리 앱입니다.

## 프로젝트 열기

1. Android Studio에서 `StudioManager` 폴더를 Open
2. Gradle Sync 완료 대기
3. 에뮬레이터 또는 실기기 선택 후 Run (▶)

## 빌드 (터미널)

```bash
cd StudioManager
./gradlew assembleDebug
```

APK 경로: `app/build/outputs/apk/debug/app-debug.apk`

## 패키지 구조

```
app/src/main/java/com/studio/manager/
├── data/          # Room DB, DAO, Repository
├── domain/        # 도메인 모델
├── ui/            # Compose 화면 (Phase 3+)
└── util/          # 날짜·포맷·상수
```

## 기본값 (Phase 0 확정)

- 룸: 1, 2, 3, 4, 7, 8, 9, 10, 13, 14, 15, 16, 17, S
- 단일 운영자, 로컬 DB only, 반복 예약 미포함
- 첫 실행 시 샘플 데이터 자동 시드

## 진행 상태

- [x] Phase 0 — 요구사항 확정
- [x] Phase 1 — 프로젝트 셋업
- [x] Phase 2 — 데이터 모델 (Room)
- [ ] Phase 3 — UI 5탭
- [ ] Phase 4 — 비즈니스 로직 완성
- [ ] Phase 5 — 시연 준비
- [ ] Phase 6 — APK 빌드 가이드
- [ ] Phase 7 — 품질 점검
