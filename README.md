# Bloom 🌸

> 나의 리듬을 부드럽게 따라가는 주기 다이어리

마지막 생리 시작일과 평균 주기만 알려주면, 다음 생리·배란·가임기를 한눈에 보여주는
가벼운 웹 앱이에요. 데이터는 브라우저 안에서만 다뤄지며, 어디로도 전송되지 않습니다.

## 브랜드

- **이름** — Bloom (블룸)
- **태그라인** — 나의 리듬을 부드럽게 따라가는 주기 다이어리
- **컬러 팔레트**
  - Primary `#f4584a` (Bloom Coral) — 따뜻한 산호빛
  - Accent `#3e9663` (Soft Sage) — 가임기/안정감
  - Sand `#fdfaf5` — 부드러운 배경 톤
- **타이포** — Pretendard Variable
- **로고** — 6장의 꽃잎과 황금빛 중심을 가진 미니멀 마크

## 기술 스택

- React 19 · TypeScript · Vite
- Tailwind CSS (커스텀 Bloom 팔레트)
- Zustand (입력 상태)
- date-fns (날짜 계산)

## 개발

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # 프로덕션 번들
npm run lint
```

## 디렉터리

```
src/
  App.tsx              # Bloom 헤더 · 로고 마크 · 레이아웃
  components/
    InputForm.tsx      # 주기 입력 (STEP 1)
    ResultCard.tsx     # 예측 결과 카드들
    PhaseGuide.tsx     # 현재 시기별 케어 가이드
  data/phaseGuides.ts  # 시기별 음식·영양제·파트너 팁·준비물
  store/cycleStore.ts  # Zustand 스토어
  utils/cycle.ts       # 주기 계산 로직
```

## 면책

Bloom의 예측은 평균 주기를 바탕으로 한 안내예요. 의학적 진단을 대체하지
않으며, 컨디션이 평소와 다르다면 전문가와 상담해 주세요.
