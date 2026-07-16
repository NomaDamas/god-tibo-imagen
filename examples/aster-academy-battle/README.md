# 아스터 아카데미 자동 전투

선택한 1번 방향을 독립적인 이미지 에셋과 코드 UI로 분해한 844×390 모바일 가로형 전투 프로토타입이다.

## 실행

```bash
npm install
npm run dev
```

에셋 계약과 프로덕션 빌드는 다음 명령으로 확인한다.

```bash
npm run verify:assets
npm run verify:monsters
npm run build
```

## 에셋 구조

- `public/assets/backgrounds`: UI가 없는 전장 배경
- `public/assets/heroes`: 투명 배경 영웅 전신 4종
- `public/assets/portraits`: 스킬 카드용 투명 초상 4종
- `public/assets/enemies`: 투명 배경 적 3종
- `public/assets/effects`: 투명 배경 전투 이펙트 3종
- `public/assets/reference`: 선택한 방향 원본
- `src/data/asset-manifest.json`: 화면 배치, 크기, 방향, 체력 데이터
- `src/data/monster-archetypes.json`: 20구역·100원형 정본
- `src/data/monster-catalog.json`: 네 등급을 확장한 400종 카탈로그
- `src/data/monster-production.json`: 실제 제작이 끝난 원형 목록
- `public/assets/monsters`: 제작이 끝난 투명 몬스터 컷아웃

UI는 이미지에 굽지 않고 React와 CSS로 구성했다. 일시정지, 배속, AUTO, 방치 보상, 스킬 코스트와 전투 타이머가 동작한다.

## 400종 몬스터 생산

몬스터는 투명 PNG 한 장과 공용 모션 프로필로 움직인다. `MONSTER LAB`에서 제작 완료된 80종의 대기·이동·공격·피격·사망 상태를 구역과 계열별로 확인할 수 있다.

```bash
npm run build:monster-catalog
npm run verify:monster-catalog
npm run test:monsters
npm run verify:monster-assets
```

완성된 중앙 광장, 기록 도서관, 체육 실습관, 응용 과학동은 구역마다 다섯 원형을 기초형·강화형·오류형·초월형으로 확장한 80종이다. 이후 구역도 `monster-production.json`에 제작 원형을 추가하면 같은 계약으로 검증과 전시 범위가 함께 확장된다.
