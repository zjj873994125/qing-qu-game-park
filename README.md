# Desire Poker

单机手机网页扑克牌小游戏。应用默认不内置文案数据，需要用户在本机导入 JSON 后使用；导入的数据保存在当前浏览器的本地存储中，不会上传到服务器。

## 功能

- 点击按钮抽取扑克牌。
- 先抽到牌背，再点击开牌。
- 牌面文案默认打码，赢家点击后显示文案。
- 牌面花色和点数每次从 52 张标准扑克牌中随机生成，和文案不绑定。
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
      "level": "light",
      "content": "这里填写文案"
    }
  ],
  "femaleCards": [
    {
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

- `maleCards`：男生版文案池数组。
- `femaleCards`：女生版文案池数组。
- `positionList.categories`：列表分类枚举，key 是内部分类名，value 是页面显示名。
- `positionList[分类名]`：和 `categories` 中 key 同名的字符串数组。
- `level`：`light`、`stimulating`、`intense`。
- `content`：牌面文案，不能为空。

抽牌时会先从当前版本和当前程度的文案池里随机取一条文案，再独立随机生成一张 52 张标准扑克牌里的牌面。旧 JSON 如果还带 `suit`、`rank` 也可以导入，但这两个字段会被忽略。

## 已有文件

- `content-template.json`：空模板。
- `content-import.json`：由当前三份 JSON 整合出的可导入文件。
- `src/male-cards.json`、`src/female-cards.json`、`src/position-list.json`：历史拆分数据文件，当前应用运行时不直接读取。

## GitHub Actions 部署

仓库包含自动构建部署工作流：

```text
.github/workflows/deploy.yml
```

触发方式：

- push 到 `main` 分支自动执行。
- 在 GitHub Actions 页面手动执行 `Build and Deploy`。

执行流程：

1. 安装依赖：`npm ci`
2. 运行测试：`npm test`
3. 构建：`npm run build`
4. 通过 SSH/rsync 把 `dist/` 发布到服务器目录。

需要在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 中配置：

```text
DEPLOY_HOST      服务器 IP 或域名
DEPLOY_USER      SSH 用户名
DEPLOY_SSH_KEY   SSH 私钥
DEPLOY_PATH      服务器部署目录，例如 /var/www/desire-poker
```

服务器需要提前准备：

- `DEPLOY_USER` 可以 SSH 登录服务器。
- `DEPLOY_USER` 对 `DEPLOY_PATH` 有写入权限。
- 服务器已安装并配置 Nginx 或其他静态 Web 服务，站点根目录指向 `DEPLOY_PATH`。

当前项目按子路径部署配置，访问地址形如：

```text
http://elevator.cluehub.pankiss.cn/poker/
```

对应 GitHub Secret：

```text
DEPLOY_PATH=/opt/desire-poker
```

Nginx 可以加在已有 `elevator.cluehub.pankiss.cn` 的 `server` 中，且要放在 `location /` 前面：

```nginx
location = /poker {
    return 301 /poker/;
}

location /poker/ {
    alias /opt/desire-poker/;
    index index.html;
    try_files $uri $uri/ /poker/index.html;
}
```

项目的 Vite `base` 已设置为 `/poker/`，静态资源路径也会跟随这个子路径。

只会发布 `dist/` 里的构建产物。`content-import.json` 已在 `.gitignore` 中忽略，不会被提交和部署。

## 注意

这个项目适合本机或局域网自用。不要把包含敏感文案的 JSON 上传到公开服务器或公开传播。
