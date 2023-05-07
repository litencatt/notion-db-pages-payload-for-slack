import * as core from '@actions/core'
import * as fs from 'fs'
// import {Client, LogLevel} from '@notionhq/client'

// const notion = new Client({
//   auth: process.env.NOTION_API_TOKEN,
//   logLevel: LogLevel.DEBUG
// })

// const databaseId = process.env.NOTION_DB_ID

async function run(): Promise<void> {
  try {
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'タグ付け未完了エスカレタスク一覧',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: '以下タグ付けされていないためタグ付けをお願いします:pray:'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '- <https://google.com|Page1>\n- <https://google.com|Page2>\n- <https://google.com|Page3>'
          }
        }
      ]
    }
    core.debug(JSON.stringify(payload, null, 2))
    fs.writeFileSync('payload.json', JSON.stringify(payload), {
      encoding: 'utf-8'
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
