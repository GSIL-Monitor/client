//electron `主进程`入口
const electron = require('electron');
const platform = require('os').platform();  // 获取平台：https://nodejs.org/api/os.html#os_os_platform
const dialog = electron.dialog;
const app = electron.app;
const Tray = electron.Tray;
const Menu = electron.Menu;
const windowsManager = require('../src/framework/managers/windowsManager');
const WindowsNameKeys = require('../src/application/mainProcessBackGround/common/windowsNameKeys.js');
const ChannelEventTypes = require('../src/application/communication/channelEventTypes.js');
const desktop = require('../src/framework/adapter/desktopMainAdapter');
const backgroundProvider = require('../src/framework/adapter/backgroundProvider')
const ProjectInfo = require('../src/application/mainProcessBackGround/store/projectInfo.js');
const FileManager = require('../src/framework/managers/fileManager');
const path = require('path');
let appIcon = null


function onReady() {
    createTray()
    registerChannelListener();
    beforeLunch()
}

function beforeLunch(){
    lunchMainWindow();
}


function lunchMainWindow() {
    console.log('start Lunch')
    registerBackgroundProvider();
    windowsManager.showWindow(WindowsNameKeys.MAIN_WINDOW)
}

//注册本地请求函数处理模块
function registerBackgroundProvider() {
    backgroundProvider.addMoudleMap('/projectType', ProjectInfo.getCategoryAttribute);
    backgroundProvider.addMoudleMap('/searchProjects', ProjectInfo.searchProjects);
    backgroundProvider.addMoudleMap('/addProject', ProjectInfo.addProject);
    backgroundProvider.addMoudleMap('/editProject', ProjectInfo.editProject);
    backgroundProvider.addMoudleMap('/deleteProject', ProjectInfo.deleteProject);
    backgroundProvider.addMoudleMap('/syncProject', ProjectInfo.syncProject);
    backgroundProvider.addMoudleMap('/getBucket', FileManager.getBucket.bind(FileManager));
    backgroundProvider.addMoudleMap('/deleteFiles', FileManager.deleteFiles.bind(FileManager));
    backgroundProvider.addMoudleMap('/uploadEmptyFolders', FileManager.uploadEmptyFolders.bind(FileManager));
}

//注册一些不属于窗口层的，render发送过来的监听
function registerChannelListener(){
    
}

app.on('ready', onReady);

app.on('window-all-closed', function () {
    console.log('window-all-closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    console.log('activate');
    if (process.platform === 'darwin') {
        if(windowsManager.getOpenWindowsCount()===0){
            onReady();
        }

        //  hide 之后点击 Dock 栏重新显示
        if (!windowsManager.isWindowShowing(WindowsNameKeys.MAIN_WINDOW)) {
            windowsManager.showWindowNoCreate(WindowsNameKeys.MAIN_WINDOW)
        } else {
            windowsManager.showWindowNoCreate(WindowsNameKeys.MAIN_WINDOW)
        }
    }
});

app.on('before-quit', function () {
    console.log('before-quit');
    if (process.platform === 'darwin') {
        windowsManager.destroyWindow(WindowsNameKeys.MAIN_WINDOW);
    }
});

// 创建托盘
function createTray(){
    if (process.platform != 'darwin') {
        const iconpath = path.join(__dirname, 'icon.ico');
        const image = electron.nativeImage.createFromPath(iconpath);
        appIcon = new Tray(image)
        console.log(appIcon);
        const contextMenu = Menu.buildFromTemplate([
            {label: '退出', click: function () {
                // 只有强制销毁
                windowsManager.destroyWindow(WindowsNameKeys.MAIN_WINDOW);
                app.quit()
            }},
        ])
        appIcon.setToolTip('This is my application.')
        appIcon.setContextMenu(contextMenu)

        appIcon.on('click', () => {
            console.log(windowsManager.isWindowShowing(WindowsNameKeys.MAIN_WINDOW),'====isWindowShowing====');
            if (!windowsManager.isWindowShowing(WindowsNameKeys.MAIN_WINDOW)) {
                windowsManager.showWindowNoCreate(WindowsNameKeys.MAIN_WINDOW)
            } else {
                windowsManager.showWindowNoCreate(WindowsNameKeys.MAIN_WINDOW)
            }
        })
    }
}