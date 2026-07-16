# Design QA

- Source reference: `public/assets/reference/battle-direction-01.png`
- Target viewport: 844×390
- Implementation: React/Vite prototype
- Asset verification: PASS, 16 raster assets
- Monster catalog verification: PASS, 20 zones / 100 archetypes / 400 unique entries
- Monster system tests: PASS, 6 tests
- Monster cutout verification: PASS, 140 RGBA cutouts
- Production build: PASS
- HTTP smoke check: PASS (`/` and representative PNG returned 200)
- Visual screenshot comparison: BLOCKED

## Blocker

제품 디자인 검수용 인앱 Browser 런타임이 페이지 캡처 전에 `Cannot redefine property: process`로 초기화에 실패했다. 지침상 다른 브라우저 자동화 도구로 우회하지 않았으므로, 소스 이미지와 구현 화면을 나란히 비교하는 최종 시각 판정은 수행하지 못했다.

## Static review

- 배경, 영웅, 적, 초상, 이펙트가 독립 파일로 분리됨
- 영웅과 적의 방향값 및 깊이 정렬값을 데이터로 제어함
- 844×390 고정 비율 안에서 HUD가 절대 배치됨
- 버튼은 모두 실제 상호작용에 연결됨
- 캐릭터·적·이펙트는 투명 PNG 계약을 통과함
- `MONSTER LAB`은 7개 구역·35개 계열·140종 선택, 다섯 동작, 일시정지, 배속을 코드로 연결함

final result: blocked — 브라우저 캡처 기반 시각 비교 필요
