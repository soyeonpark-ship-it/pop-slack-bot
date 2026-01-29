import pkg from '@slack/bolt';
const { App } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Slack 앱 초기화 (Railway 최적화)
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // Socket Mode 사용 (방화벽 뒤에서도 작동)
  appToken: process.env.SLACK_APP_TOKEN,
  // Railway에서는 PORT 변수 사용 안 함 (Socket Mode)
  logLevel: 'INFO'
});

// 알림 받을 그룹 멤버들
const groupMembers = process.env.GROUP_MEMBERS.split(',').map(id => id.trim());

console.log('🎯 알림 대상 멤버:', groupMembers);

// "ppop" 텍스트를 감지하는 이벤트 리스너 (대소문자 구분 없음)
app.message(/ppop/i, async ({ message, say, client }) => {
  try {
    console.log('🔔 ppop 감지됨!', message);

    const sender = message.user;
    const channel = message.channel;
    const messageLink = `https://slack.com/app_redirect?channel=${channel}&message_ts=${message.ts}`;

    // 각 그룹 멤버에게 DM 전송
    for (const memberId of groupMembers) {
      // 테스트를 위해 자기 자신도 포함 (나중에 제외하려면 아래 줄 주석 해제)
      // if (memberId === sender) continue;

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
      name: 'hourglass_flowing_sand',
      timestamp: message.ts
    });

    console.log('✨ 모든 알림 전송 완료');
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
});

// 앱 시작 (Railway 최적화)
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack ppop 알림 봇이 실행되었습니다!');
    console.log('📝 "ppop" 메시지를 보내면', groupMembers.length, '명에게 알림이 전송됩니다.');
    
    // Keep alive - 연결 유지 (1분마다로 단축)
    setInterval(() => {
      console.log('🔄 Keep alive - ' + new Date().toISOString());
    }, 60 * 1000); // 1분마다
    
    // 프로세스 종료 방지
    process.on('SIGTERM', () => {
      console.log('⚠️ SIGTERM 받음 - 정상 종료 중...');
    });
    
    process.on('SIGINT', () => {
      console.log('⚠️ SIGINT 받음 - 정상 종료 중...');
    });
    
  } catch (error) {
    console.error('❌ 앱 시작 실패:', error);
    process.exit(1); // Railway가 자동 재시작
  }
})();
