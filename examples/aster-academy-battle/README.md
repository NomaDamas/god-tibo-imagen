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

UI는 이미지에 굽지 않고 React와 CSS로 구성했다. 일시정지, 배속, AUTO, 방치 보상, 스킬 코스트와 전투 타이머가 동작한다.
