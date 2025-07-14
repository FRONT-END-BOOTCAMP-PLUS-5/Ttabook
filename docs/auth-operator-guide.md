# Ttabook 인증 시스템 운영 가이드

## 개요

본 문서는 Ttabook 인증 시스템을 운영하고 유지보수하는 담당자를 위한 가이드입니다. 시스템 모니터링, 트러블슈팅, 보안 관리, 그리고 비상 상황 대응 방법을 다룹니다.

## 시스템 아키텍처

### 핵심 구성 요소

```
Frontend (Next.js)
├── SessionProvider (React Context)
├── ProtectedRoute (Route Guard)
└── Auth Hooks (useSession)

Backend API (Clean Architecture)
├── API Routes (/api/signup/(adaptor), /signin/(adaptor), /me/(adaptor), /refresh/(adaptor), /logout/(adaptor))
│   └── Next.js API route handlers in (adaptor) folders following Clean Architecture
├── Use Cases (비즈니스 로직 - /backend/auth/*/usecases/)
├── Domain Services (AuthService, CookieService - /backend/common/infrastructures/auth/)
└── Repository Layer (Supabase - /backend/common/infrastructures/repositories/)

External Services
├── Supabase Database (사용자 데이터)
└── JWT Token Management (세션 관리)
```

### 데이터 플로우

1. **인증 요청** → API Route → Use Case → Repository → Database
2. **JWT 토큰 생성** → 쿠키 설정 → 클라이언트 세션 관리
3. **토큰 검증** → 미들웨어 → Protected Resource 접근

## 환경 변수 관리

### 필수 환경 변수

```bash
# Supabase 연결 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 보안 설정
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
BCRYPT_ROUNDS=12

# 환경 설정
NODE_ENV=production
PORT=3000
```

### 환경 변수 검증

시스템 시작 시 `/lib/config.ts`에서 자동 검증:

- JWT_SECRET 길이 검증 (최소 32자)
- Supabase URL 형식 검증
- 필수 변수 존재 여부 확인

### 보안 관리

#### JWT Secret 로테이션 절차

1. **준비 단계**

   ```bash
   # 새로운 JWT secret 생성
   openssl rand -base64 64
   ```

2. **배포 전 검증**

   ```bash
   # 테스트 환경에서 새 secret 검증
   JWT_SECRET="new-secret" yarn test
   ```

3. **점진적 배포**

   ```bash
   # 1. Blue-Green 배포로 downtime 최소화
   # 2. 기존 토큰 만료 시간(15분) 고려
   # 3. 사용자 재로그인 공지
   ```

4. **롤백 계획**
   ```bash
   # 이전 JWT_SECRET 백업 보관
   # 긴급 롤백 시 즉시 적용 가능
   ```

## 모니터링 및 알럿

### 핵심 메트릭

#### 1. 인증 성공률

```
Target: > 95%
Alert: < 90% (5분간)

측정 방법:
- 2xx 응답 / 전체 인증 요청
- 엔드포인트별 분석 (/signin, /signup, /refresh)
```

#### 2. 토큰 만료율

```
Target: < 5% (정상적 만료 제외)
Alert: > 10% (10분간)

모니터링 포인트:
- 15분 내 토큰 만료 (비정상)
- Refresh token 실패율
```

#### 3. 데이터베이스 응답 시간

```
Target: < 100ms (P95)
Alert: > 500ms (5분간)

모니터링 쿼리:
- SELECT users by email
- INSERT new users
```

#### 4. 시스템 리소스

```
Memory: < 80%
CPU: < 70%
Disk: < 85%

Alert: 임계값 초과 시 즉시 알럿
```

### 로그 분석

#### 중요 로그 패턴

```bash
# 성공적인 인증
INFO: "User authenticated successfully" { userId: "xxx", email: "xxx" }

# 실패한 인증 (보안 이벤트)
WARN: "Authentication failed" { email: "xxx", reason: "invalid_password" }

# 시스템 오류
ERROR: "Database connection failed" { error: "connection timeout" }

# 토큰 관련 오류
ERROR: "JWT verification failed" { token: "xxx...", error: "expired" }
```

#### 로그 검색 예시

```bash
# 특정 사용자의 인증 기록
grep "user@example.com" /var/log/ttabook/auth.log

# 과도한 로그인 시도 탐지
grep "Authentication failed" /var/log/ttabook/auth.log | grep "$(date +%Y-%m-%d)" | wc -l

# 시스템 오류 패턴 분석
grep "ERROR:" /var/log/ttabook/auth.log | tail -50
```

### 대시보드 구성

#### 실시간 모니터링 패널

1. **인증 성공률** (5분 단위)
2. **활성 세션 수** (실시간)
3. **API 응답 시간** (P50, P95, P99)
4. **오류율** (엔드포인트별)

#### 보안 모니터링 패널

1. **비정상 로그인 시도** (시간당)
2. **계정 생성률** (일별)
3. **토큰 만료 패턴** (시간대별)
4. **지역별 접속 분포**

## 트러블슈팅 가이드

### 일반적인 문제 및 해결책

#### 1. 사용자가 로그인할 수 없음

**증상**

```
- 로그인 폼에서 "서버 오류" 메시지
- HTTP 500 에러 응답
```

**진단 절차**

```bash
# 1. 데이터베이스 연결 확인
curl -X GET "http://localhost:3000/api/duplicates?email=test@example.com"

# 2. JWT Secret 검증
echo $JWT_SECRET | wc -c  # 32자 이상이어야 함

# 3. Supabase 연결 테스트
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?select=count"
```

**해결 방법**

```bash
# A. 환경 변수 재설정
export JWT_SECRET="new-valid-secret-minimum-32-characters"
export SUPABASE_SERVICE_ROLE_KEY="valid-key"

# B. 애플리케이션 재시작
systemctl restart ttabook

# C. 데이터베이스 연결 복구
# Supabase 콘솔에서 연결 상태 확인
```

#### 2. 토큰 만료 오류가 빈발함

**증상**

```
- 15분 이내 토큰 만료
- "토큰이 만료되었습니다" 오류 다발
```

**진단 절차**

```bash
# 1. 서버 시간 동기화 확인
timedatectl status

# 2. JWT 설정 검증
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({test: true}, process.env.JWT_SECRET, {expiresIn: '15m'});
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('Token valid:', !!decoded);
"
```

**해결 방법**

```bash
# A. 시간 동기화
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd

# B. JWT 설정 재검증
# /lib/jwt.ts의 토큰 만료 시간 확인
# accessToken: 15분, refreshToken: 14일
```

#### 3. 데이터베이스 연결 실패

**증상**

```
- 모든 API 엔드포인트에서 500 에러
- "Database connection failed" 로그
```

**진단 절차**

```bash
# 1. Supabase 서비스 상태 확인
curl -I https://your-project.supabase.co

# 2. 네트워크 연결 테스트
ping your-project.supabase.co

# 3. API Key 유효성 검증
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

**해결 방법**

```bash
# A. Supabase 설정 검증
# 프로젝트 설정에서 API URL과 Service Role Key 재확인

# B. 네트워크 방화벽 확인
# Supabase IP 대역 허용 여부 검증

# C. 연결 재시도 로직 확인
# Repository layer의 error handling 검토
```

### 성능 문제 해결

#### 1. 응답 시간 지연

**진단**

```bash
# API 응답 시간 측정
time curl -X POST "http://localhost:3000/api/signin" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'

# 데이터베이스 쿼리 성능 분석
# Supabase 대시보드에서 Slow Query 확인
```

**최적화 방법**

```sql
-- 자주 사용되는 쿼리 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
```

#### 2. 메모리 사용량 증가

**진단**

```bash
# Node.js 메모리 사용량 모니터링
ps aux | grep node
top -p $(pgrep node)

# 메모리 리크 감지
node --inspect server.js
# Chrome DevTools Memory 탭 사용
```

**해결책**

```bash
# 메모리 제한 설정
node --max-old-space-size=1024 server.js

# 가비지 컬렉션 모니터링
node --trace-gc server.js
```

## 보안 사고 대응

### 비상 상황 대응 절차

#### 1. JWT Secret 노출 의심

**즉시 조치**

```bash
# 1. 새로운 JWT Secret 생성
NEW_SECRET=$(openssl rand -base64 64)

# 2. 모든 서버에 긴급 배포
kubectl set env deployment/ttabook JWT_SECRET="$NEW_SECRET"

# 3. 모든 사용자 강제 로그아웃
# (새 secret으로 기존 토큰 무효화됨)
```

**후속 조치**

```bash
# 1. 로그 분석으로 영향 범위 확인
grep "JWT" /var/log/ttabook/* | grep "$(date +%Y-%m-%d)"

# 2. 사용자 공지 및 재로그인 안내
# 3. 보안 감사 수행
```

#### 2. 대량 비정상 로그인 시도

**탐지**

```bash
# 1시간 내 실패한 로그인 시도 수 확인
grep "Authentication failed" /var/log/ttabook/auth.log | \
grep "$(date --date='1 hour ago' '+%Y-%m-%d %H')" | wc -l
```

**대응**

```bash
# 1. IP 기반 임시 차단
iptables -A INPUT -s 악성_IP -j DROP

# 2. Rate limiting 강화
# nginx 설정에서 req/min 제한 추가

# 3. 모니터링 강화
# 실시간 알럿 임계값 조정
```

#### 3. 데이터베이스 보안 사고

**즉시 조치**

```bash
# 1. 데이터베이스 연결 차단
# Supabase 콘솔에서 API 비활성화

# 2. 백업 데이터 확인
# 최신 백업 시점 및 무결성 검증

# 3. 영향 범위 분석
# 접근 로그 및 쿼리 기록 분석
```

### 정기 보안 점검

#### 월간 점검 항목

```bash
# 1. 환경 변수 보안 점검
echo "JWT_SECRET 길이: $(echo $JWT_SECRET | wc -c)"
echo "마지막 변경일: $(stat -c %y .env | cut -d' ' -f1)"

# 2. 의존성 취약점 스캔
yarn audit
npm audit

# 3. 로그 보안 이벤트 분석
grep -i "failed\|error\|unauthorized" /var/log/ttabook/auth.log | \
tail -100

# 4. 사용자 계정 이상 활동 검토
# 대량 계정 생성, 비정상 로그인 패턴 등
```

#### 분기별 점검 항목

```bash
# 1. 전체 시스템 보안 감사
# 외부 보안 업체 또는 내부 보안팀 수행

# 2. 재해 복구 계획 테스트
# 백업 복원 및 시스템 복구 절차 검증

# 3. 액세스 권한 검토
# 개발자 및 운영자 권한 재검토

# 4. 보안 정책 업데이트
# 최신 보안 위협에 따른 정책 갱신
```

## 백업 및 복구

### 데이터 백업 전략

#### 1. 자동 백업 (Supabase)

```bash
# Supabase 자동 백업 설정 확인
# - 일간 백업: 7일 보관
# - 주간 백업: 4주 보관
# - 월간 백업: 3개월 보관
```

#### 2. 수동 백업

```bash
# 사용자 데이터 백업
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 환경 설정 백업
cp .env .env.backup.$(date +%Y%m%d)
cp -r config/ config.backup.$(date +%Y%m%d)/
```

### 복구 절차

#### 1. 데이터베이스 복구

```bash
# 1. 서비스 중단
systemctl stop ttabook

# 2. 백업 복원
psql $DATABASE_URL < backup_20240101_120000.sql

# 3. 데이터 무결성 검증
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. 서비스 재시작
systemctl start ttabook
```

#### 2. 설정 복구

```bash
# 환경 변수 복원
cp .env.backup.20240101 .env

# 서비스 재시작
systemctl restart ttabook

# 기능 테스트
curl -X GET "http://localhost:3000/api/me"
```

## 성능 최적화

### 데이터베이스 최적화

#### 인덱스 관리

```sql
-- 필수 인덱스 생성
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type
ON users(type);

-- 인덱스 사용률 모니터링
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename = 'users';
```

#### 쿼리 최적화

```sql
-- 느린 쿼리 식별
SELECT query, mean_time, calls
FROM pg_stat_statements
WHERE query LIKE '%users%'
ORDER BY mean_time DESC
LIMIT 10;
```

### 애플리케이션 최적화

#### JWT 토큰 최적화

```typescript
// JWT 페이로드 최소화
const payload = {
  id: user.id, // 필수만 포함
  email: user.email,
  role: user.type,
  // 불필요한 데이터 제거
};
```

#### 캐싱 전략

```typescript
// Redis 캐싱 (선택적)
// - 사용자 세션 정보 캐싱
// - 자주 조회되는 사용자 데이터 캐싱
// - TTL: 15분 (access token과 동일)
```

## 운영 체크리스트

### 일간 체크리스트

- [ ] 시스템 리소스 사용률 확인 (CPU, Memory, Disk)
- [ ] API 응답 시간 모니터링 (< 100ms P95)
- [ ] 오류율 확인 (< 1%)
- [ ] 백업 상태 점검
- [ ] 보안 로그 검토

### 주간 체크리스트

- [ ] 의존성 업데이트 확인
- [ ] 성능 트렌드 분석
- [ ] 용량 계획 검토
- [ ] 장애 대응 훈련
- [ ] 문서 업데이트

### 월간 체크리스트

- [ ] JWT Secret 로테이션 검토
- [ ] 보안 감사 수행
- [ ] 재해 복구 테스트
- [ ] 성능 최적화 계획 수립
- [ ] 사용자 피드백 분석

### 분기별 체크리스트

- [ ] 전체 시스템 아키텍처 검토
- [ ] 비즈니스 연속성 계획 업데이트
- [ ] 팀 교육 및 지식 공유
- [ ] 외부 보안 감사
- [ ] 기술 로드맵 수립

## 연락처 및 지원

### 긴급 연락망

- **시스템 관리자**: [연락처]
- **보안 담당자**: [연락처]
- **개발팀 리드**: [연락처]

### 외부 지원

- **Supabase 지원팀**: support@supabase.io
- **Next.js 커뮤니티**: https://github.com/vercel/next.js
- **보안 신고**: security@ttabook.com

---

_본 문서는 Ttabook 인증 시스템의 안정적인 운영을 위한 가이드입니다. 시스템 변경 시 반드시 문서를 업데이트하시기 바랍니다._
