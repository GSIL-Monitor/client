const electron = require('electron');
const platform = require('os').platform();  // 获取平台：https://nodejs.org/api/os.html#os_os_platform
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;



const TYPE_WEBCONTENT = {
    WILL_NAVIGATE: 'type_webcontents_will_navigate'
}

/**
* 添加webComtents监听
* @param bridegWindow {BridegWindow} 自定义的Window
* @param webContentType {string} 类型
* @param callBackFunc {function} 回调
* @return void
*/
function addWebContentsListener(bridegWindow, webContentType, callBackFunc) {
    console.log("enter webcontent listener")
    switch (webContentType) {
        case this.TYPE_WEBCONTENT.WILL_NAVIGATE:
            const win = bridegWindow.win
            const webContents = win.webContents;
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
* 移除所有webComtents监听
* @param {BridegWindow} bridegWindow  自定义的Window
*/
function removeAllWebContentsListener(bridegWindow) {

    const win = bridegWindow.win
    const webContents = win.webContents;
    webContents.removeAllListeners();


}

//todo 拆分close
function createWindows(bridegWindow) {
    let param = bridegWindow.windowParam;
    let win = param ? new BrowserWindow({
        width: bridegWindow.width, height: bridegWindow.height, ...param
    }) : new BrowserWindow({
        width: bridegWindow.width, height: bridegWindow.height
    });
    if (bridegWindow.title) {
        console.log('set title ', bridegWindow.title)
        win.setTitle(bridegWindow.title)
    }
    win.loadURL(bridegWindow.url);
    win.once('ready-to-show', () => {
        if (!win.isVisible()) {
            win.show()
        }
    });
    // win.once('close', bridegWindow.onClose);
    //代码之前是once注册时间，为了频繁切换隐藏，改成了on注册
    win.on('close', (event) => {
        console.log(event,'==close===event======');
        const windowsManager = require('../../framework/managers/windowsManager.js')
        // windowsManager.clearWindow(bridegWindow.WINDOW_NAME) //旧代码，待删除
        // 必须要阻止默认行为
        event.preventDefault();
        win.hide()
    });
    return win
}


/**
 * 派发Channel事件
 * @param {BridgeWindow} bridegWindow 自定义的Window
 * @param {string} channelEventType 
 * @param {Object} param 携带的数据
 */
function dispatchChannelEvent(bridegWindow, channelEventType, param) {
    let content = bridegWindow.win.webContents;
    content.send(channelEventType, param);
}

/**
 * 关闭窗口
 * @param {BridegWindow} bridegWindow 自定义的Window
 */
function closeWindows(bridegWindow) {
    let win = bridegWindow.win
    win.close();
}

/**
 * 显示窗口
 * @param {BridegWindow} bridegWindow 自定义的Window
 */
function showWindows(bridegWindow) {
    let win = bridegWindow.win
    win.show();
}


/**
 * 显示窗口
 * @param {BridegWindow} bridegWindow 自定义的Window
 */
function destroyWindows(bridegWindow) {
    let win = bridegWindow.win
    win.destroy()
}

/**
 * 最小化窗口
 * @param {BridegWindow} bridegWindow 自定义的Window
 */
function minusWindow(bridegWindow) {
    let win = bridegWindow.win
    win.minimize()
}



/**
 * 添加Channel监听
 * @param {string} channelEventType 
 * @param {function} callBackFunc 
 */
function addChannelEventListener(channelEventType, callBackFunc) {
    ipcMain.on(channelEventType, callBackFunc)
}

/**
 * 移除Channel监听
 * @param {string} channelEventType 
 * @param {function} callBackFunc 
 */
function removeChannelEventListener(channelEventType, callBackFunc) {
    ipcMain.removeListener(channelEventType, callBackFunc)
}

/**
 * 移除Channel所有监听
 * @param {string} channelEventType 
 * @param {function} callBackFunc 
 */
function removeChannelEventAllListener(channelEventType) {
    ipcMain.removeAllListeners(channelEventType)
}

/**
 * 退出app
 */
function quitApp() {
    app.quit();
}

/**
 * 获取平台
 * @return {string}
 */
function getPlatform() {
    return platform
}

/**
 * 弹出错误提示
 * @param {string} tltle 
 * @param {string} content 
 */
function showErrorBox(tltle, content) {
    dialog.showErrorBox(tltle, content);
}


/**
 * 
 * @param {Template} template 菜单模板(desktop,bridgewindow,languageManager)
 * @param {languageManager} LanguageManager 语言管理器
 * @param {BridegWindow} bridegWindow 自定义的window
 * @param {bool} isGlobal 是否全局菜单
 */
function buildMenuTemplate(template, languageManager, bridegWindow, isGlobal = false) {
    let menu = template ? Menu.buildFromTemplate(template(this, bridegWindow, languageManager)) : null;
    if (isGlobal) {
        Menu.setApplicationMenu(menu);
    } else {
        bridegWindow.win.setMenu(menu)
    }
}

module.exports = {
    TYPE_WEBCONTENT,
    createWindows,
    closeWindows,
    showWindows,//显示窗口
    destroyWindows, //强制关闭窗口
    addWebContentsListener,
    addChannelEventListener,
    dispatchChannelEvent,
    removeAllWebContentsListener,
    removeChannelEventListener,
    removeChannelEventAllListener,
    minusWindow,
    quitApp,
    showErrorBox,
    getPlatform,
    buildMenuTemplate
}



