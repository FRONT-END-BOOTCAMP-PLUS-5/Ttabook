# 데이터베이스 스키마 변경 런타임 이슈 수정 계획

## 📋 현재 상황 분석

### 완료된 작업
- Supabase 스키마 파일 업데이트 완료 (`supabase.ts` → 새로운 스키마로 교체)
- 빌드/린트 테스트 통과 ✓

### 주요 스키마 변경사항
- **제거된 테이블**: `room_items`, `supplies`
- **새 테이블**: `assets` (id, room_id, type, position_x/y, width/height)
- **reservations**: `space_id` 제거, `room_id`/`user_id` 필수값화
- **rooms**: `position_x/y`, `scale_x/y`, `supply_id` 제거, `space_id` 필수값화, `width/height` 추가

## 🔍 영향받는 파일 분석 (총 25개 파일)

### 1. 엔터티 레이어 (5개 파일)
- `backend/common/domains/entities/Room.ts` - Supply[], supplyId, roomItemId, spaceId, position/scale 필드 포함
- `backend/common/domains/entities/Supply.ts` - 완전히 삭제 예정 엔터티
- `backend/common/domains/entities/RoomItem.ts` - 완전히 삭제 예정 엔터티  
- `backend/common/domains/entities/Rsv.ts` - Room 엔터티, spaceId 필드 사용
- `backend/common/domains/entities/Space.ts` - Room 엔터티 의존성

### 2. 리포지토리 레이어 (4개 파일)
- `backend/common/infrastructures/repositories/SbRoomRepository.ts` - supply_id, position/scale 필드 사용 (심각)
- `backend/common/infrastructures/repositories/SbRsvRepository.ts` - space_id 쿼리, Room 엔터티 사용
- `backend/common/infrastructures/repositories/SbSpaceRepository.ts` - supplies 조인 쿼리
- `backend/common/domains/repositories/roomRequest.ts` - supplyId, position/scale 필드 포함

### 3. 유스케이스 레이어 (6개 파일)
- `backend/user/reservations/usecases/GetUserRsvUsecase.ts` - spaceId 사용
- `backend/admin/reservations/usecases/GetRsvListUsecase.ts` - spaceId 사용  
- `backend/admin/spaces/usecases/PutSpaceUsecase.ts` - spaceId 사용
- `backend/admin/spaces/usecases/PostRoomUsecase.ts` - supplyId 사용
- `backend/admin/spaces/usecases/PutRoomUsecase.ts` - supplyId 사용
- `backend/rooms/reservations/usecases/GetRoomRsvUsecase.ts` - spaceId 파라미터 사용

### 4. DTO 레이어 (6개 파일)
- `backend/spaces/dtos/GetSpaceDto.ts` - supplies 배열 포함
- `backend/user/reservations/dtos/GetUserRsvDto.ts` - space_id 필드
- `backend/user/reservations/dtos/PostUserRsvDto.ts` - spaceId 필드
- `backend/admin/reservations/dtos/GetRsvListDto.ts` - spaceId 필드
- `backend/admin/spaces/dtos/PutSpaceQueryDto.ts` - spaceId 필드
- `backend/admin/spaces/dtos/PostRoomQueryDto.ts`, `PutRoomQueryDto.ts` - supplyId 필드

### 5. API 라우트 레이어 (4개 파일)
- `app/api/user/reservations/(adaptor)/route.ts` - spaceId 필드 사용
- `app/api/admin/spaces/(adaptor)/route.ts` - spaceId 필드 사용
- `app/api/rooms/reservations/(adaptor)/route.ts` - spaceId 파라미터 사용
- `app/api/spaces/(adaptor)/route.ts` - spaceId 파라미터 사용

## 🎯 수정 계획 (우선순위별)

### Phase 1: 엔터티 모델 수정 (HIGH PRIORITY)

#### 1.1 Room 엔터티 업데이트
```typescript
// 제거할 필드들
- public supplies: Supply[]
- public supplyId: number  
- public roomItemId: number
- public positionX: number
- public positionY: number
- public scaleX: number
- public scaleY: number

// 추가/수정할 필드들  
- public spaceId: number (필수)
- public width?: number
- public height?: number
```

#### 1.2 Assets 엔터티 생성
```typescript
export class Asset {
  constructor(
    public id: number,
    public roomId: number,
    public type: string,
    public positionX?: number,
    public positionY?: number,
    public width?: number,
    public height?: number
  ) {}
}
```

#### 1.3 사용하지 않는 엔터티 제거
- `Supply.ts` 삭제
- `RoomItem.ts` 삭제  
- `index.ts`에서 export 제거

### Phase 2: 리포지토리 레이어 수정 (HIGH PRIORITY)

#### 2.1 SbRoomRepository.ts 완전 리팩토링
```typescript
// 제거할 필드들
- supply_id
- position_x, position_y
- scale_x, scale_y  

// 추가/수정할 필드들
- space_id (필수)
- width, height
```

#### 2.2 SbRsvRepository.ts 수정
- `space_id` 쿼리 및 조인 제거
- `room` 조인을 통해 간접적으로 space 정보 접근
- Room 엔터티 의존성 업데이트

#### 2.3 SbSpaceRepository.ts 수정
- `supplies (*)` 조인을 `assets (*)` 조인으로 변경

#### 2.4 Assets 리포지토리 생성
- `SbAssetsRepository.ts` 새로 생성
- CRUD 기본 기능 구현

### Phase 3: 요청/응답 모델 수정 (MEDIUM PRIORITY)

#### 3.1 roomRequest.ts 수정
```typescript
// 제거할 필드들
- public supplyId: string
- public positionX: number
- public positionY: number  
- public scaleX: number
- public scaleY: number

// 추가할 필드들
- public spaceId: number
- public width?: number
- public height?: number
```

#### 3.2 rsvRequest.ts 수정
- `spaceId` 필드 제거 (room을 통한 간접 접근)

### Phase 4: DTO 레이어 수정 (MEDIUM PRIORITY)

#### 4.1 예약 관련 DTO 수정
- `GetUserRsvDto.ts`: `space_id` 필드 제거
- `PostUserRsvDto.ts`: `spaceId` 필드 제거
- `GetRsvListDto.ts`: `spaceId` 필드 제거
- space 관련 정보는 room을 통해 간접 접근

#### 4.2 공간 관련 DTO 수정
- `GetSpaceDto.ts`: `supplies` 배열을 `assets` 배열로 변경

#### 4.3 방 관련 DTO 수정
- `PostRoomQueryDto.ts`, `PutRoomQueryDto.ts`: `supplyId` 필드 제거

### Phase 5: 유스케이스 레이어 수정 (MEDIUM PRIORITY)

#### 5.1 예약 유스케이스들
- `GetUserRsvUsecase.ts`: spaceId 로직을 room.spaceId로 간접 접근
- `GetRsvListUsecase.ts`: spaceId 로직을 room.spaceId로 간접 접근
- `GetRoomRsvUsecase.ts`: spaceId 파라미터 제거

#### 5.2 방 유스케이스들
- `PostRoomUsecase.ts`: supplyId 로직을 assets 로직으로 변경
- `PutRoomUsecase.ts`: supplyId 로직을 assets 로직으로 변경

#### 5.3 공간 유스케이스들
- `PutSpaceUsecase.ts`: spaceId 관련 로직 업데이트

### Phase 6: API 라우트 수정 (LOW PRIORITY)

#### 6.1 API 계약 변경
- spaceId 파라미터 제거 또는 room을 통한 간접 접근으로 변경
- 호환성을 위한 임시 브리지 로직 고려
- `user/reservations/route.ts`: spaceId 필드 제거
- `admin/spaces/route.ts`: spaceId 필드 로직 업데이트
- `rooms/reservations/route.ts`: spaceId 파라미터 제거
- `spaces/route.ts`: spaceId 파라미터 로직 업데이트

### Phase 7: 테스트 및 검증 (CRITICAL)

#### 7.1 단위 테스트 업데이트
- 모든 변경된 클래스의 테스트 케이스 업데이트
- 새로운 Assets 엔터티 테스트 추가

#### 7.2 통합 테스트 실행  
- 리포지토리 레이어 통합 테스트
- API 엔드포인트 테스트

#### 7.3 API 테스트 검증
- Postman/REST Client로 API 동작 확인
- 프론트엔드 호환성 테스트

#### 7.4 데이터 마이그레이션 스크립트 작성
- 기존 데이터베이스 데이터 마이그레이션 계획 수립

## 🚨 주요 위험 요소

1. **Breaking Changes**: API 계약 변경으로 인한 프론트엔드 호환성 문제
2. **데이터 무결성**: 기존 데이터베이스 데이터 마이그레이션 필요
3. **복잡한 의존성**: space_id 제거로 인한 비즈니스 로직 변경
4. **테스트 커버리지**: 대규모 변경으로 인한 예상치 못한 버그 위험

## 📝 구현 전략

1. **브랜치 전략**: `feature/schema-migration` 브랜치에서 작업
2. **단계적 구현**: Phase별로 순차 진행, 각 단계마다 테스트
3. **백워드 호환성**: 가능한 경우 임시 브리지 로직 구현
4. **문서화**: 변경사항 상세 문서화 
5. **롤백 계획**: 문제 발생 시 롤백 전략 수립

## 📅 타임라인

- **Phase 1-2**: 엔터티 및 리포지토리 수정 (1-2일)
- **Phase 3-4**: 요청/응답 모델 및 DTO 수정 (1일)  
- **Phase 5**: 유스케이스 레이어 수정 (1일)
- **Phase 6**: API 라우트 수정 (1일)
- **Phase 7**: 테스트 및 검증 (1-2일)

**총 예상 기간**: 5-7일

## 📞 연락처 및 승인

- **계획 작성일**: 2025-07-14
- **승인 필요 사항**: Breaking Changes 관련 API 계약 변경
- **롤백 트리거**: 프론트엔드 호환성 문제 또는 심각한 데이터 손실 위험

---

**이 문서는 스키마 마이그레이션 진행 과정에서 지속적으로 업데이트됩니다.**