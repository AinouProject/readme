# AinouHook 开发

Ainou Hook 能帮你低成本接入各聊天平台（是的，甚至包括QQ！）以实现自有功能，仅需维护一个简单的 web 服务。

## 注册你的 webhook

要使用 webhook，首先你需要注册 Ainou 帐号。目前，Ainou 尚未全面开放注册，请参考注册文档以注册帐号。

使用 webhook 指令，可以注册一个新 webhook。注册时，你需要给定一个触发词，以 `-触发词` 开头的消息都将转发至你设置的 webhook 地址。

触发词在注册时不需要全局唯一，且仅有你自己可以使用。若想将你的服务接入 Ainou 以提供给所有人使用，请联系我们，提交功能说明文档。

## 接收消息

若有**注册用户**（为了防止滥用，匿名用户不可以使用 webhook）发送了以 `-触发词` 开头的消息，这条消息将会以 JSON 格式，放在 request body 中，以 HTTP POST 的方式转发至你的服务器上。消息体如下：

```json
{
  "type": "command",
  "token": "your-token-here",
  "message": {},
  "user": {},
  "session": {},
  "source": {}
}
```

其中，`type` 为`command` 或 `message` ，前者为 `-触发词` 触发，后者为使用 session 绑定触发。

`token` 为你注册 webhook 时，Ainou 生成的 token。

而 `message`， `user`，`source` 和 `session` 的格式在 [Ainou 数据格式](./data-types.md) 一文中说明。

同时，你可以在该 http 请求的回应体中，响应一个发送消息的 JSON 对象。

## 发送消息

通过 webhook，你可以向 48 小时内曾与你互动的任意用户或频道发送消息。

向 `https://openhook.ainou.asia/ainou/{hookId}/{authToken}` 发送 POST 信息如下：

```http
POST /ainou/{hookId}/{authToken}
Host: openhook.ainou.asia
Content-Type: application/json

{
  "message": {},
  "recipient": {},
  "session": {},
  "keepSession": true
}
```

其中 `{hookId}` 和 `{authToken}` 需要被替换为你注册的 hook id 和 token，而其它字段在 [Ainou 数据格式](./data-types.md) 一文中说明。

请注意我们目前只支持 `text` 消息格式的发送。

如果将 `keepSession` 标记设为 `true`，那么该用户（或者频道）接下来发送的消息，即使并非以触发词开头，也将会发送到你的 webhook 上（直到用户/频道沉默15分钟，或 webhook 主动设为 false）。

若没有特殊需求，建议忽略 `keepSession` 参数。因为无论将 `keepSession` 参数设为 `true` 或 `false`，用户的当前上下文（若有）都会被清理。若你是通知类应用，这可能导致用户的其它操作被中断。

### 处理错误

#### 同步错误

发送消息时可能会遇到错误。遇到错误时，你发送的 POST 请求可能遇到以下回应：

```json
{"error": 1, "message": "something happend"}
```

这代表处理你的请求遇到了一些问题，请根据返回的错误码排查。若错误码为 503，你可以简单的等待一秒后重试。若没有遇到错误，调用 api 发送的返回信息为：

```json
{"error": 0}
```

这代表一切和平，你的消息已经进入到了 Ainou 的队列中。

#### 异步错误

此外，我们可能会往你的 webhook 回调中发送一些错误信息。这通常是由于你传入的 token 不正确、或向错误的目标发送了消息。错误格式如下：

```json
{
  "type": "error",
  "message": "undefined is not a function"
}
```

若你不在意消息的送达率，你可以比较安全的忽略这些消息。

### 处理上下文

Ainou 为你准备了一些 session 存储空间，你可以简单地在发送消息时使用它们。Session 会遵循 Ainou 统一的上下文管理策略；额外地，还有以下限制：

* Session 被 JSON 编码后，总长度不得超过 4k

每当你将 session 传入后，在 15 分钟内下次调用 webhook 时，该对象会原样传入你的 webhook 地址。若你还需要保留他们，你需要在下次调用时继续将他们传入，否则 session 会被清空。

你可以在 session 中保存一些与上下文相关的变量，便于你编写连贯的对话逻辑。