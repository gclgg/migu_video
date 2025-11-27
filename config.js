// 用户id
const userId = process.env.muserId || ""
// 用户token 可以使用网页登录获取
const token = process.env.mtoken || ""
// 本地运行端口号
const port = process.env.mport || 1234
// 访问地址，用于epg和节目访问。
// 空字符串 = 动态使用来访者 Host（IPv6/域名/IP 自动适配）
const host = ""
// 画质
// 4蓝光(需要登录且账号有VIP)
// 3高清
// 2标清
const rateType = process.env.mrateType || 3

export { userId, token, port, host, rateType }
