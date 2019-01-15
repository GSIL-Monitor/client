const {ipcRenderer, shell} = window.require('electron')

export const TYPE_WEBCONTENT = {
    WILL_NAVIGATE : 'type_webcontents_will_navigate'
}





/**
* 添加webComtents监听
* @param listenerType {string} 类型
* @param callBackFunc {function} 回调
* @return void
*/
export function addWebContentsListener(listenerType, callBackFunc) {
    console.log("enter webcontent listener")
    switch (listenerType) {
        case this.TYPE_WEBCONTENT.WILL_NAVIGATE:
            const { remote: { getCurrentWindow } } = window.require("electron");
            const webContents = getCurrentWindow().webContents;
            console.log("enter TYPE_WEBCONTENTS_WILL_NAVIGATE")
            webContents.on("will-navigate", (evt, url) => {
                console.log("enter callBack")
                callBackFunc({ event: evt, url });
            });
            break;
        default:
            console.log(this.TYPE_WEBCONTENT.WILL_NAVIGATE);
            break;
    }
}

/**
 * 发送Channel事件
 * @param {string} channelEventType 
 * @param {Object} param 
 */
export function dispatchChannelEvent(channelEventType, param){
    ipcRenderer.send(channelEventType, param);
}

/**
 * 添加Channel事件监听
 * @param {string} channelEventType 
 * @param {function} callBackFunc 
 */
export function addChannelEventListener(channelEventType, callBackFunc){
    ipcRenderer.on(channelEventType, callBackFunc);
}

/**
 * 移除Channel事件监听
 * @param {string} channelEventType 
 * @param {function} callBackFunc 
 */
export function removeChannelEventListener(channelEventType, callBackFunc){
    ipcRenderer.removeListener(channelEventType, callBackFunc);
}
/**
 * 移除Channel所有事件监听
 * @param {string} channelEventType 
 */
export function removeChannelEventAllListener(channelEventType){
    ipcRenderer.removeAllListeners(channelEventType);
}



/**
 * 打开外部链接
 * @param {string} url 
 */
export function openExternalLink(url){
    if(url.indexOf('https')===0){
        shell.openExternal(url)
    }else{
        console.log('desktopRenderAdapter ', 'url error , only can open https protocol')
    }
    
}


export default {
    TYPE_WEBCONTENT,
    addWebContentsListener,
    dispatchChannelEvent,
    addChannelEventListener,
    removeChannelEventListener,
    openExternalLink,
    removeChannelEventAllListener
}

