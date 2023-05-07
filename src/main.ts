import * as core from '@actions/core'
import * as fs from 'fs'
import {Client, LogLevel, isFullPage} from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
  logLevel: LogLevel.DEBUG
})

const databaseId = process.env.NOTION_DB_ID

async function run(): Promise<void> {
  try {
    if (databaseId === undefined) {
      return
    }
    const filter = core.getInput('filter')
    JSON.stringify(filter)
    const headerText = core.getInput('header')
    const desc = core.getInput('description')

    const pages = []
    let cursor: string | undefined = undefined
    const isLoop = true
    while (isLoop) {
      const {results, next_cursor} = await notion.databases.query({
        database_id: databaseId,
        // @ts-ignore
        filter: JSON.parse(filter),
        start_cursor: cursor
      })
      pages.push(...results)
      if (!next_cursor) {
        break
      }
      cursor = next_cursor
    }

    const pageLinks = ['- ']
    for (const page of pages) {
      if (page.object !== 'page') {
        continue
      }
      if (!isFullPage(page)) {
        continue
      }
      for (const [, prop] of Object.entries(page.properties)) {
        if (prop.type === 'title') {
          pageLinks.push(`<${page.url}>|${prop.title[0].plain_text}`)
        }
      }
    }
    const blocks = []
    if (headerText !== undefined) {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText
        }
      })
    }
    if (desc !== undefined) {
      blocks.push({
        type: 'section',
        text: {
          type: 'plain_text',
          text: desc
        }
      })
    }
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: pageLinks.join('\n-')
      }
    })
    const payload = {blocks}
    core.debug(JSON.stringify(payload, null, 2))
    fs.writeFileSync('payload.json', JSON.stringify(payload), {
      encoding: 'utf-8'
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
