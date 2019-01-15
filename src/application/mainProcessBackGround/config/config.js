//设置文件

const isDev = process.env.NODE_ENV === 'development' ? true : true
const isServerDev = true




const config = {
    appId: isServerDev ? 'wx25132a15f53f8c83' : 'wxe6112f184d055453',
    baseURL : isServerDev ? 'atest.yk.qq.com' : 'yingli.tencent.com',
    protocol : 'https',
}




module.exports = config