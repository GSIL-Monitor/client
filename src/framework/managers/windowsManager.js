//window管理类
const desktop = require('../adapter/desktopMainAdapter.js')
const loginWindow = require('../../application/mainProcessBackGround/windows/loginWindow.js')
const mainWindow = require('../../application/mainProcessBackGround/windows/mainWindow.js')


var windowsName2ConfigDictionary = {}
var windowsDictionary = {}


//注册窗口
function registerWindows() {
    console.log('register')
    //todo 拆分出来，外部注册，与window解耦
    windowsName2ConfigDictionary[loginWindow.WINDOW_NAME] = loginWindow;
    windowsName2ConfigDictionary[mainWindow.WINDOW_NAME] = mainWindow;
}


/**
 * 打开窗口
 * @param {string} windowName 窗口名称
 */
function showWindow(windowName) {
    console.log('enter show window ', windowName)
    if (windowsName2ConfigDictionary[windowName]) {
        let windowsClass = windowsName2ConfigDictionary[windowName].WINDOW_CLASS;
        let windowInstance = new windowsClass();
        windowInstance.win = desktop.createWindows(windowInstance)
        if(windowInstance.title){
            console.log('set title ', windowInstance.title)
            windowInstance.win.setTitle(windowInstance.title)
        }
        windowInstance.onCreated();
        windowsDictionary[windowName] = windowInstance;
    }else{
        console.log('can not find window class ', windowName)
    }
}

/**
 * 关闭窗口
 * @param {string} windowName 窗口名称
 */
function closeWindow(windowName){
    console.log('enter close window ', windowName)
    if (windowsDictionary[windowName]) {
        let windowInstance = windowsDictionary[windowName]
        desktop.closeWindows(windowInstance)
    }else{
        console.log('can not find window ', windowName)
    }
}
// win.destroy()
/**
 * 强制关闭窗口窗口
 * @param {string} windowName 窗口名称
 */
function destroyWindow(windowName){
    console.log('enter destroy window ', windowName)
    if (windowsDictionary[windowName]) {
        let windowInstance = windowsDictionary[windowName]
        desktop.destroyWindows(windowInstance)
    }else{
        console.log('can not find destroy window ', windowName)
    }
}
/**
 * 显示窗口
 * @param {string} windowName 窗口名称
 */
function showWindowNoCreate(windowName){
    console.log('enter showWindow ', windowName)
    if (windowsDictionary[windowName]) {
        let windowInstance = windowsDictionary[windowName]
        desktop.showWindows(windowInstance)
    }else{
        console.log('can not find window ', windowName)
    }
}

/**
 * 关闭所有窗口
 * @param {string} windowName 窗口名称
 * @param {Array} excludeWindowNamesArr 不关闭的窗口名字数组
 */
function closeAllWindows(excludeWindowNamesArr = null){
    for(key in windowsDictionary){
        if(excludeWindowNamesArr && excludeWindowNamesArr.indexOf(key) >= 0){
            continue;
        }
        if(windowsDictionary[key]){
            closeWindow(key)
        }
    }
}

/**
 * 最小化窗口
 * @param {string} windowName 窗口名称
 */
function minusWindow(windowName){
    console.log('enter minus window ', windowName)
    if (windowsDictionary[windowName]) {
        let windowInstance = windowsDictionary[windowName]
        desktop.minusWindow(windowInstance)
    }else{
        console.log('can not find window ', windowName)
    }
}

/**
 * 清空窗口缓存
 * 无需外部调用
 * @param {string} windowName 
 */
function clearWindow(windowName){
    console.log('enter clear window ', windowName)
    if (windowsDictionary[windowName]) {
        let windowInstance = windowsDictionary[windowName]
        windowsDictionary[windowName] = null;
        let win = windowInstance.win;
        windowInstance.win = null;
    }else{
        console.log('can not find window ', windowName)
    }
}

/**
 * 判断窗口是否开启
 * @param {string} windowName 窗口名称
 * @returns boolean
 */
function isWindowShowing(windowName){
    if(windowsDictionary[windowName]){
        if(windowsDictionary[windowName].win){
            return true
        }
    }
    return false;
}

function getOpenWindowsCount(){
    let count = 0;
    for(key in windowsDictionary){
        if(windowsDictionary[key]){
            count += 1;
        }
    }
    return count;
}

registerWindows();

module.exports = {
    showWindow,////显示窗体，并创建新窗体
    isWindowShowing,
    closeWindow,
    clearWindow,
    getOpenWindowsCount,
    minusWindow,
    closeAllWindows,
    showWindowNoCreate,//单纯显示窗体，不创建窗体
    destroyWindow //强制关闭窗口
}




