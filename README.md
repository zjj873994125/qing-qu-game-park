# Desire Poker

单机手机网页扑克牌小游戏。应用默认不内置文案数据，需要用户在本机导入 JSON 后使用；导入的数据保存在当前浏览器的本地存储中，不会上传到服务器。

## 功能

- 摇一摇或点击按钮抽取扑克牌。
- 先抽到牌背，再点击开牌。
- 牌面文案默认打码，赢家点击后显示文案。
- 支持男生版、女生版两套牌组。
- 支持轻度、升温、强烈三个程度。
- 支持列表文案分类浏览。
- 支持导入 JSON 和清空本机数据。

## 本地运行

```bash
npm install
npm run dev
```

构建生产包：

```bash
npm run build
```

本地预览生产包：

```bash
npm run preview
```

运行测试：

```bash
npm test
```

## 手机局域网访问

电脑和手机连接同一个 Wi-Fi 后，在项目目录运行：

```bash
npm run dev -- --host 0.0.0.0
```

查看电脑局域网 IP：

```bash
ipconfig getifaddr en0
```

如果输出是 `192.168.1.23`，手机浏览器打开：

```text
http://192.168.1.23:5173
```

如果 Vite 提示使用了其他端口，以终端显示的端口为准。

## JSON 导入

页面首次打开时没有牌组和列表数据，需要点击“导入 JSON”选择本地文件。

iOS Safari 可以导入 `.json` 文件。文件可以放在“文件”App、iCloud Drive、下载目录，或通过 AirDrop 保存到手机后选择。

导入后数据会保存到当前浏览器本地。清除 Safari 网站数据、换浏览器、无痕模式或换设备都会导致数据不可用，需要重新导入。

## JSON 格式

完整结构：

```json
{
  "maleCards": [
    {
      "suit": "spades",
      "rank": "A",
      "level": "light",
      "content": "这里填写文案"
    }
  ],
  "femaleCards": [
    {
      "suit": "hearts",
      "rank": "K",
      "level": "intense",
      "content": "这里填写文案"
    }
  ],
  "positionList": {
    "categories": {
      "blowjob": "游戏A"
    },
    "blowjob": [
      "这里填写列表文案"
    ]
  }
}
```

字段说明：

- `maleCards`：男生版牌组数组。
- `femaleCards`：女生版牌组数组。
- `positionList.categories`：列表分类枚举，key 是内部分类名，value 是页面显示名。
- `positionList[分类名]`：和 `categories` 中 key 同名的字符串数组。
- `suit`：`spades`、`hearts`、`diamonds`、`clubs`。
- `rank`：`A`、`2` 到 `10`、`J`
、`Q`、`K`。
- `level`：`light`、`stimulating`、`intense`。
- `content`：牌面文案，不能为空。

## 已有文件

- `content-template.json`：空模板。
- `content-import.json`：由当前三份 JSON 整合出的可导入文件。
- `src/male-cards.json`、`src/female-cards.json`、`src/position-list.json`：历史拆分数据文件，当前应用运行时不直接读取。

## 注意

这个项目适合本机或局域网自用。不要把包含敏感文案的 JSON 上传到公开服务器或公开传播。
