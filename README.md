## Slack send payload generate GitHub Action
Generate a Slack send payload json file from Notion DB query result.

### Setup
- Slack
  - [Slack Webhook Setup](https://github.com/slackapi/slack-github-action/blob/main/README.md#setup)
- Notion
  -  [Create Notion Integration](https://developers.notion.com/docs/create-a-notion-integration)

### Usage
- This action is supposed to be used with [slackapi/slack-github-action](https://github.com/slackapi/slack-github-action)
- This action generate a payload data file to `./payload.json`
  - And then you passing it to `slackapi/slack-github-action`.`payload-file-path`.

#### Notion DB pages example
<img width="800" alt="image" src="https://user-images.githubusercontent.com/17349045/236668536-63c7f9ce-e881-4e74-9781-10ef9fe17849.png">

#### Slack Notify message example
<img width="497" alt="image" src="https://user-images.githubusercontent.com/17349045/236668546-2b380116-c720-45e3-8857-a1772f25afb3.png">

  
```yml
name: Action Test
on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Generate send payload for slack
        uses: litencatt/notion-db-pages-payload-for-slack@v1.0.1
        env:
          NOTION_API_TOKEN: ${{ secrets.NOTION_API_TOKEN }}
          NOTION_DB_ID: ${{ secrets.NOTION_DB_ID }}
        with:
          header: Header
          description: Description
          filter: |
            {
              "property": "Select",
              "select": {
                "equals": "Foo"
              }
            }

      - name: Send custom JSON data to Slack workflow
        id: slack
        uses: slackapi/slack-github-action@v1.23.0
        with:
          payload-file-path: "./payload.json"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```          

