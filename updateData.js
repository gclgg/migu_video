import { dataList } from "./utils/fetchList.js"
import { appendFile, appendFileSync, renameFileSync, writeFile } from "./utils/fileUtil.js"
import { updatePlaybackData } from "./utils/playback.js"
import { /* refreshToken as mrefreshToken, */ host, token, userId } from "./config.js"
import refreshToken from "./utils/refreshToken.js"
import { printGreen, printRed, printYellow } from "./utils/colorOut.js"

async function update(hours) {

  const date = new Date()
  const start = date.getTime()
  let interfacePath = ""
  // 获取数据
  const datas = await dataList()
  printGreen("数据获取成功！")

  if (!(hours % 24)) {
    // 必须绝对路径
    interfacePath = process.cwd() + '/interface.txt.bak'
    // 创建写入空内容
    writeFile(interfacePath, "")
  }

  if (!(hours % 24)) {
    // 每24小时刷新token
    if (userId != "" && token != "") {
      // if (mrefreshToken) {
      await refreshToken(userId, token) ? printGreen("token刷新成功") : printRed("token刷新失败")
      // } else {
      // printGreen(`跳过token刷新`)
      // }
    }
    appendFile(interfacePath, `#EXTM3U x-tvg-url="\${replace}/playback.xml" catchup="append" catchup-source="?playbackbegin=\${(b)yyyyMMddHHmmss}&playbackend=\${(e)yyyyMMddHHmmss}"\n`)
  }
  printYellow("正在更新...")
  // 回放
  const playbackFile = process.cwd() + '/playback.xml.bak'
  writeFile(playbackFile,
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<tv generator-info-name="Tak" generator-info-url="${host}">\n`)

  // 分类列表
  for (let i = 0; i < datas.length; i++) {

    const data = datas[i].dataList
    // 写入节目
    for (let j = 0; j < data.length; j++) {

      await updatePlaybackData(data[j], playbackFile)

      if (!(hours % 24)) {
        // 写入节目
        appendFile(interfacePath, `#EXTINF:-1 tvg-id="${data[j].name}" tvg-name="${data[j].name}" tvg-logo="${data[j].pics.highResolutionH}" group-title="${datas[i].name}",${data[j].name}\n\${replace}/${data[j].pID}\n`)
        // printGreen(`    节目链接更新成功`)
      }
    }
    if (!(hours % 24)) {
      printGreen(`分类###:${datas[i].name} 更新完成！`)
    }
  }

  appendFileSync(playbackFile, `</tv>\n`)

  // 重命名
  renameFileSync(playbackFile, playbackFile.replace(".bak", ""))
  if (!(hours % 24)) {
    renameFileSync(interfacePath, interfacePath.replace(".bak", ""))
  }
  printYellow("更新完成！")
  const end = Date.now()
  printYellow(`本次耗时: ${(end - start) / 1000}秒`)
}


export default update
