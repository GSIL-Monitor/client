//向本地请求数据
const stringify = require('../common/js/stringify');
const { ipcRenderer } = window.require('electron')

/**
 * 向本地请求数据
 * @param {string} url 请求本地资源的地址uri
 * @param {Object} param 请求时携带的数据参数
 * @return Promise reject(err) resolve({url, param})
 */
export function request(url, param) {
    return new Promise(function (resolve, reject) {
        console.log('REQ:', url, stringify(param));
        ipcRenderer.once('backgroundResponse' + url + stringify(param), (event, url, param) => {
            // console.log('backgroundResponse event, url, param', event, url, param)
            if (param.err) {
                reject(param.err)
            } else {
                resolve({url, param})
            }
        });
        ipcRenderer.send('backgroundRequest', url, param);
    });

}

/**
 * 向本同步地请求数据
 * @param {string} url 请求本地资源的地址uri
 * @param {Object} param 请求时携带的数据参数
 * @return param 如果错误，param.err返回错误信息
 */
export function syncRequest(url, param) {
    return ipcRenderer.sendSync('backgroundSyncRequest', url, param);
}



export default {
    request,
    syncRequest
}