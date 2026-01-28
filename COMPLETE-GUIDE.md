# 🔔 Slack Bot Complete Guide

**"ppop" 한 마디로 그룹 전체에게 DM 알림 보내기!**

---

## 📋 목차

1. [개요](#개요)
2. [준비물](#준비물)
3. [1단계: Slack 앱 만들기](#1단계-slack-앱-만들기)
4. [2단계: 봇 설정하기](#2단계-봇-설정하기)
5. [3단계: 코드 준비](#3단계-코드-준비)
6. [4단계: 로컬 실행](#4단계-로컬-실행)
7. [5단계: 자동 실행 설정](#5단계-자동-실행-설정)
8. [문제 해결](#문제-해결)

---

## 개요

### 🎯 이런 기능을 만듭니다:

- **누구든지** Slack 채널에서 "ppop" 입력
- **지정된 그룹 멤버들**에게 자동으로 DM 알림
- **메시지 링크 포함** - 클릭하면 원본 메시지로 이동
- **예쁜 알림 UI** - 버튼과 포맷팅

### 💡 사용 예시:

```
[Connect 채널]
김철수: ppop 긴급 회의 시작합니다!

[자동 DM - 그룹 멤버들에게]
🔔 ppop 알림이 왔습니다!
@김철수님이 그룹을 호출했습니다.

📍 메시지:
ppop 긴급 회의 시작합니다!

[메시지 보러가기 🔗]
```

---

## 준비물

- ✅ Slack workspace (무료 가능)
- ✅ Node.js 설치 (https://nodejs.org)
- ✅ 컴퓨터 (Windows/Mac/Linux)
- ✅ 10분 정도의 시간

---

## 1단계: Slack 앱 만들기

### 1-1. Slack 앱 생성

1. **https://api.slack.com/apps** 접속
2. **Create New App** 클릭
3. **From scratch** 선택
4. 입력:
   - **App Name**: `ppop 알림봇` (원하는 이름)
   - **Pick a workspace**: 설치할 workspace 선택
5. **Create App** 클릭

---

## 2단계: 봇 설정하기

### 2-1. Socket Mode 활성화

1. 왼쪽 메뉴에서 **Socket Mode** 클릭
2. **Enable Socket Mode** 토글 ON
3. **Token Name**: `ppop-socket` 입력
4. **Generate** 클릭
5. ⚠️ **토큰 복사해서 저장** (xapp-로 시작)

### 2-2. 봇 권한 설정

1. 왼쪽 메뉴에서 **OAuth & Permissions** 클릭
2. **Scopes** → **Bot Token Scopes** 섹션으로 스크롤
3. 다음 권한들 추가 (**Add an OAuth Scope** 클릭):
   ```
   channels:history      # 채널 메시지 읽기
   groups:history        # 비공개 채널 메시지 읽기
   im:history           # DM 메시지 읽기
   im:write             # DM 보내기
   chat:write           # 메시지 보내기
   reactions:write      # 리액션 추가
   users:read           # 사용자 정보 읽기
   ```

4. 페이지 상단으로 스크롤
5. **Install to Workspace** 클릭
6. **Allow** 클릭
7. ⚠️ **Bot User OAuth Token 복사** (xoxb-로 시작)

### 2-3. Event Subscriptions 설정

1. 왼쪽 메뉴에서 **Event Subscriptions** 클릭
2. **Enable Events** 토글 ON
3. **Subscribe to bot events** 섹션에서 다음 추가:
   ```
   message.channels     # 채널 메시지
   message.groups       # 비공개 채널 메시지
   message.im           # DM 메시지
   ```
4. **Save Changes** 클릭

### 2-4. App-Level Token 확인

1. 왼쪽 메뉴에서 **Basic Information** 클릭
2. **App-Level Tokens** 섹션 확인
3. Socket Mode 활성화 시 생성된 토큰 확인 (xapp-로 시작)

### 2-5. Signing Secret 복사

1. 같은 페이지 **App Credentials** 섹션
2. **Signing Secret** 옆의 **Show** 클릭
3. ⚠️ **복사해서 저장**

### 2-6. 사용자 ID 확인

1. Slack 앱에서 알림받을 사람들의 프로필 클릭
2. **⋯** (더보기) → **Copy member ID** 클릭
3. 모든 그룹 멤버의 ID 복사 (U로 시작하는 ID)

---

## 3단계: 코드 준비

### 3-1. 프로젝트 폴더 생성

```bash
mkdir slack-ppop-bot
cd slack-ppop-bot
```

### 3-2. package.json 생성

```json
{
  "name": "slack-ppop-notifier",
  "version": "1.0.0",
  "description": "ppop 텍스트로 그룹 멤버에게 알림을 보내는 Slack 봇",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": ["slack", "bot", "notification"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@slack/bolt": "^3.17.1",
    "dotenv": "^16.4.1"
  }
}
```

### 3-3. server.js 생성

```javascript
import pkg from '@slack/bolt';
const { App } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Slack 앱 초기화
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// 알림 받을 그룹 멤버들
const groupMembers = process.env.GROUP_MEMBERS.split(',').map(id => id.trim());

console.log('🎯 알림 대상 멤버:', groupMembers);

// "ppop" 텍스트를 감지하는 이벤트 리스너
app.message(/ppop/i, async ({ message, say, client }) => {
  try {
    console.log('🔔 ppop 감지됨!', message);

    const sender = message.user;
    const channel = message.channel;
    const messageLink = `https://slack.com/app_redirect?channel=${channel}&message_ts=${message.ts}`;

    // 각 그룹 멤버에게 DM 전송
    for (const memberId of groupMembers) {
      try {
        // DM 채널 열기
        const result = await client.conversations.open({
          users: memberId
        });

        // DM으로 알림 전송
        await client.chat.postMessage({
          channel: result.channel.id,
          text: `🔔 *ppop 알림*`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🔔 *ppop 알림이 왔습니다!*\n\n<@${sender}>님이 그룹을 호출했습니다.`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📍 *메시지:*\n${message.text}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: '메시지 보러가기 🔗'
                  },
                  url: messageLink,
                  style: 'primary'
                }
              ]
            }
          ]
        });

        console.log(`✅ ${memberId}에게 알림 전송 완료`);
      } catch (error) {
        console.error(`❌ ${memberId}에게 알림 전송 실패:`, error);
      }
    }

    // 원본 채널에 확인 메시지 (이모지 리액션)
    await client.reactions.add({
      channel: channel,
      name: 'white_check_mark',
      timestamp: message.ts
    });

    console.log('✨ 모든 알림 전송 완료');
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
});

// 앱 시작
(async () => {
  await app.start();
  console.log('⚡️ Slack ppop 알림 봇이 실행되었습니다!');
  console.log('📝 "ppop" 메시지를 보내면', groupMembers.length, '명에게 알림이 전송됩니다.');
})();
```

### 3-4. .env 파일 생성

```bash
SLACK_BOT_TOKEN=xoxb-여기에-당신의-봇토큰
SLACK_SIGNING_SECRET=여기에-signing-secret
SLACK_APP_TOKEN=xapp-여기에-앱토큰
GROUP_MEMBERS=U1234567890,U0987654321,U1122334455
PORT=3000
```

⚠️ **실제 값으로 교체하세요!**

### 3-5. 패키지 설치

```bash
npm install
```

---

## 4단계: 로컬 실행

### 4-1. 봇 실행

```bash
npm start
```

**성공 메시지:**
```
⚡️ Slack ppop 알림 봇이 실행되었습니다!
🎯 알림 대상 멤버: [ 'U123...', 'U456...' ]
[INFO] Now connected to Slack
```

### 4-2. 봇을 채널에 추가

1. Slack에서 원하는 채널 열기
2. 채널 이름 클릭 → **통합** (Integrations) 탭
3. **앱 추가** 클릭
4. `ppop 알림봇` 검색 후 **추가**

또는:
```
/invite @ppop알림봇
```

### 4-3. 테스트

채널에서 입력:
```
ppop 테스트입니다!
```

**예상 결과:**
- ✅ 원본 메시지에 ✅ 이모지 추가됨
- ✅ 그룹 멤버들에게 DM 알림 전송됨

---

## 5단계: 자동 실행 설정

### 5-1. PM2 설치 (프로세스 관리자)

```bash
npm install -g pm2
```

### 5-2. PM2로 봇 실행

터미널 실행 중인 봇 중지 (Ctrl+C)

```bash
pm2 start server.js --name ppop-bot
```

### 5-3. 자동 재시작 설정

```bash
pm2 save
```

### 5-4. Windows 시작 프로그램 등록

**start-on-boot.bat** 파일 생성:
```batch
@echo off
cd C:\경로\를\실제경로로\slack-ppop-bot
pm2 resurrect
```

**시작 프로그램에 등록 (PowerShell):**
```powershell
$startup = [Environment]::GetFolderPath('Startup')
Copy-Item '경로\start-on-boot.bat' -Destination $startup
```

### 5-5. 유용한 PM2 명령어

```bash
pm2 status          # 봇 상태 확인
pm2 logs ppop-bot   # 실시간 로그
pm2 restart ppop-bot # 재시작
pm2 stop ppop-bot   # 중지
pm2 delete ppop-bot # 삭제
```

---

## 🎉 완료!

### ✅ 이제 다음이 가능합니다:

- **24/7 자동 실행** - 컴퓨터만 켜져 있으면 작동
- **자동 재시작** - 크래시되면 자동 복구
- **백그라운드 실행** - 터미널 닫아도 작동
- **부팅 시 자동 시작** - 재부팅해도 자동 실행

---

## 문제 해결

### "ppop" 입력해도 반응 없음

**원인:**
- 봇이 실행 중이 아님
- 봇이 채널에 추가되지 않음
- Event Subscriptions 미설정

**해결:**
```bash
pm2 status  # 봇 상태 확인
```
- 채널에서 `/invite @봇이름` 실행
- Slack 앱 설정에서 Event Subscriptions 확인

### DM이 안 옴

**원인:**
- 사용자 ID가 잘못됨
- `im:write` 권한 없음

**해결:**
- Slack에서 사용자 ID 다시 확인 (U로 시작)
- OAuth & Permissions에서 `im:write` 권한 확인 후 재설치

### 봇이 자꾸 꺼짐

**원인:**
- PM2로 실행하지 않음
- 에러 발생

**해결:**
```bash
pm2 start server.js --name ppop-bot
pm2 logs ppop-bot  # 에러 확인
```

### 컴퓨터 재부팅 후 작동 안 함

**원인:**
- 자동 시작 미설정

**해결:**
```bash
pm2 resurrect
```
또는 시작 프로그램 배치 파일 실행

---

## 🔧 커스터마이징

### 트리거 단어 변경

**server.js**에서:
```javascript
// "ppop" → "긴급"으로 변경
app.message(/긴급/i, async ({ message, say, client }) => {
  // ...
});

// 여러 단어 감지
app.message(/ppop|긴급|알림/i, async ({ message, say, client }) => {
  // ...
});
```

### 알림 메시지 커스터마이징

**server.js**의 `blocks` 부분 수정:
```javascript
{
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `🚨 *긴급 알림!*\n\n<@${sender}>님의 호출`
  }
}
```

### 그룹 멤버 변경

**.env** 파일:
```bash
GROUP_MEMBERS=U111,U222,U333,U444  # ID 추가/제거
```

변경 후:
```bash
pm2 restart ppop-bot
```

---

## 📚 추가 자료

- **Slack Bolt 문서**: https://slack.dev/bolt-js
- **Slack API 문서**: https://api.slack.com
- **PM2 문서**: https://pm2.keymetrics.io

---

## 💡 팁

### 여러 그룹 만들기

```javascript
const groups = {
  dev: ['U111', 'U222'],
  urgent: ['U333', 'U444', 'U555'],
  all: ['U111', 'U222', 'U333', 'U444', 'U555']
};

app.message(/ppop-dev/i, async ({ message, client }) => {
  // groups.dev에게 알림
});

app.message(/ppop-urgent/i, async ({ message, client }) => {
  // groups.urgent에게 알림
});
```

### 자신 제외하기

```javascript
for (const memberId of groupMembers) {
  if (memberId === sender) continue;  // 발신자 제외
  // ...
}
```

### 알림 통계

```javascript
let notificationCount = 0;

app.message(/ppop/i, async ({ message, client }) => {
  notificationCount++;
  console.log(`📊 총 알림 횟수: ${notificationCount}`);
  // ...
});
```

---

**🎉 이제 "ppop"만 입력하면 그룹 전체에게 알림이 갑니다!**

Made with ❤️ for better team communication
