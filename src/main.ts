import * as core from '@actions/core'
import * as fs from 'fs'
import {Client, isFullPage} from '@notionhq/client'
import console from 'console'

const token = process.env.NOTION_API_TOKEN
const databaseId = process.env.NOTION_DB_ID

async function run(): Promise<void> {
  if (token === undefined) {
    core.setFailed('NOTION_API_TOKEN is not defined')
    process.exit(1)
    return
  }

  if (databaseId === undefined) {
    core.setFailed('NOTION_DB_ID is not defined')
    process.exit(1)
    return
  }

  const notion = new Client({
    auth: token
  })

  // Run local for development, set action inputs like this
  // - export INPUT_FILTER="{\"property\":\"Select\",\"select\":{\"equals\":\"Foo\"}}"
  // - export INPUT_HEADER=...
  // - export INPUT_DESCRIPTION=...
  // $ yarn dev
  const filter = core.getInput('filter')
  const headerText = core.getInput('header')
  const desc = core.getInput('description')

  try {
    JSON.parse(filter)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    process.exit(1)
  }

  try {
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
    if (pages.length === 0) {
      console.log('No pages found')
      process.exit(1)
    }

    const pageLinks = []
    for (const page of pages) {
      if (page.object !== 'page') {
        continue
      }
      if (!isFullPage(page)) {
        continue
      }
      for (const [, prop] of Object.entries(page.properties)) {
        if (prop.type === 'title') {
          pageLinks.push(`- <${page.url}|${prop.title[0].plain_text}>`)
        }
      }
    }
    const blocks = []
    if (headerText !== '') {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText
        }
      })
    }
    if (desc !== '') {
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
        text: pageLinks.join('\n')
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
