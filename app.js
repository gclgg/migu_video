import http from "node:http"
import { host, pass, port } from "./config.js";
import { getDateTimeStr } from "./utils/time.js";
import update from "./utils/updateData.js";
import { printBlue, printGreen, printMagenta, printRed } from "./utils/colorOut.js";
import { delay } from "./utils/fetchList.js";
import { channel, interfaceStr } from "./utils/appUtils.js";

// 运行时长
var hours = 0
let loading = false

const server = http.createServer(async (req, res) => {

  while (loading) {
    await delay(50)
  }

  loading = true

  // 获取请求方法、URL 和请求头
  let { method, url, headers } = req;
  // 身份认证
  if (pass != "") {
    const urlSplit = url.split("/")
    if (urlSplit[1] != pass) {
      printRed(`身份认证失败`)
      res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
      res.end(`身份认证失败`); // 发送文件内容
      loading = false
      return
    } else {
      printGreen("身份认证成功")
      url = urlSplit.length == 2 ? "/" : "/" + urlSplit[urlSplit.length - 1]
    }
  }

  // printGreen("")
  printMagenta("请求地址：" + url)

  if (method != "GET") {
    res.writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' });
    res.end(JSON.stringify({
      data: '请使用GET请求',
    }));
    printRed(`使用非GET请求:${method}`)

    loading = false
    return
  }

  const interfaceList = "/,/interface.txt,/m3u,/txt,/playback.xml"

  // 接口
  if (interfaceList.indexOf(url) !== -1) {
    const interfaceObj = interfaceStr(url, headers)
    if (interfaceObj.content == null) {
      interfaceObj.content = "获取失败"
    }
    // 设置响应头
    res.setHeader('Content-Type', interfaceObj.contentType);
    if (url == "/m3u") {
      res.setHeader('content-disposition', "inline; filename=\"interface.m3u\"");
    }
    res.statusCode = 200;
    res.end(interfaceObj.content); // 发送文件内容
    loading = false
    return
  }

  // 频道
  const result = await channel(url)

  // 结果异常
  if (result.code != 302) {

    printRed(result.desc)
    res.writeHead(result.code, {
      'Content-Type': 'application/json;charset=UTF-8',
    });
    res.end(result.desc)
    loading = false
    return
  }

  res.writeHead(result.code, {
    'Content-Type': 'application/json;charset=UTF-8',
    location: result.playURL
  });

  res.end()

  loading = false
})

server.listen(port, async () => {

  // 更新
  setInterval(async () => {
    printBlue(`准备更新文件 ${getDateTimeStr(new Date())}`)
    hours += 6
    try {
      await update(hours)
    } catch (error) {
      console.log(error)
      printRed("更新失败")
    }

    printBlue(`当前已运行${hours}小时`)
  }, 6 * 60 * 60 * 1000);

  try {
    // 初始化数据
    await update(hours)
  } catch (error) {
    console.log(error)
    printRed("更新失败")
  }

  printGreen(`本地地址: http://localhost:${port}${pass == "" ? "" : "/" + pass}`)
  if (host != "") {
    printGreen(`自定义地址: ${host}${pass == "" ? "" : "/" + pass}`)
  }
})
