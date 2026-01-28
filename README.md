# 🔔 Slack ppop 그룹 알림 봇

**Slack Connect 전용**: myrealtrip workspace 사람들이 "ppop" 입력 → aicx workspace 3명에게 자동 DM 알림!

## 🎯 사용 시나리오

- **myrealtrip workspace** 사람들이 Connect 채널에서 "ppop" 입력
- **aicx workspace** 그룹 3명에게 자동으로 DM 알림 전송
- 관리자 권한 불필요 (aicx에서만 봇 설치)

## ⚡ 빠른 시작

### 1. 설치

```bash
cd slack-bot
npm install
```

### 2. Slack 앱 설정

**📖 [CONNECT-GUIDE.md](./CONNECT-GUIDE.md) 참고** (10분 완벽 가이드)

간단 요약:
1. https://api.slack.com/apps 에서 aicx workspace에 앱 생성
2. Socket Mode, 봇 권한, Event Subscriptions 설정
3. Connect 채널에 봇 추가
4. `.env` 파일 작성

### 3. 환경 변수 설정

`.env` 파일 생성:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
GROUP_MEMBERS=U1234567890,U0987654321,U1122334455
PORT=3000
```

### 4. 실행

```bash
npm start
```

## 📖 문서

- **[CONNECT-GUIDE.md](./CONNECT-GUIDE.md)** - Slack Connect용 상세 설정 가이드 ⭐
- **[QUICKSTART.md](./QUICKSTART.md)** - 일반 workspace용 가이드

## ✨ 작동 방식

1. **myrealtrip 사람:** Connect 채널에서 "ppop" 입력
2. **봇:** 메시지 감지
3. **aicx 3명:** 각자 DM으로 알림 받음 (메시지 링크 포함)
4. **원본 메시지:** ✅ 이모지 추가

## 🎯 알림 예시

```
🔔 ppop 알림이 왔습니다!

@김철수(myrealtrip)님이 그룹을 호출했습니다.

📍 메시지:
ppop 긴급 회의 시작합니다~

[메시지 보러가기 🔗]
```

## 🔧 커스터마이징

### 멤버 변경

`.env` 파일:
```bash
GROUP_MEMBERS=U111,U222,U333,U444  # 4명으로 증가
```

### 트리거 단어 변경

`server.js`:
```javascript
app.message('ppop', ...)  // "ppop" → "긴급" 등으로 변경
```

### 여러 단어 감지

```javascript
app.message(/ppop|긴급|알림/, ...)  // ppop, 긴급, 알림 모두 감지
```

## 🖥️ 배포

### 로컬 실행
- 컴퓨터를 계속 켜둬야 함

### 클라우드 무료 호스팅
- **Render.com** (추천)
- **Railway.app**
- **Fly.io**

상세한 배포 방법은 CONNECT-GUIDE.md 참고

## ❓ 문제 해결

### ppop 입력해도 반응 없음
1. 봇이 Connect 채널에 추가되어 있나요?
2. 봇이 실행 중인가요?
3. Event Subscriptions 설정했나요?

### DM이 안 옴
1. 사용자 ID가 정확한가요? (U로 시작)
2. `im:write` 권한이 있나요?
3. 봇 로그에서 에러 확인

자세한 문제 해결은 CONNECT-GUIDE.md 참고

## 🚀 주요 기능

- ✅ **Cross-workspace 알림** (Connect 채널 필요)
- ✅ **관리자 권한 불필요** (Socket Mode)
- ✅ **예쁜 알림 UI** (버튼 + 링크)
- ✅ **로컬 실행 가능** (공개 URL 불필요)
- ✅ **쉬운 커스터마이징**

## 📦 기술 스택

- Node.js 18+
- @slack/bolt 3.17+
- Socket Mode (WebSocket)

## 📄 라이센스

MIT

---

**🎉 이제 "ppop"만 입력하면 aicx 팀에게 알림이 갑니다!**
