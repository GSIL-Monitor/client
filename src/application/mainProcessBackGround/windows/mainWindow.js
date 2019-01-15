const desktop = require('../../../framework/adapter/desktopMainAdapter.js')
const WindowsNamesKeys = require('../common/windowsNameKeys.js')
const paths = require('../../../paths.js')
const userAccount = require('../store/userAccount.js')
const ChannelEventTypes = require('../common/channelEventTypes.js')
const LanguageManager = require('../../../framework/managers/languageManager.js')
const MenuFactory = require('../../../framework/adapter/menuFactoryAdapter.js')
const BaseWindow = require('./baseWindow.js')
const fileManager = require('../../../framework/managers/fileManager');
const {dialog} = require('electron');
//todo 继承公用窗口
class WindowMain extends BaseWindow {

    constructor() {
        super();
        this.WINDOW_NAME = WindowsNamesKeys.MAIN_WINDOW;
        this.width = 1148;
        this.height = 800;
        this.title = LanguageManager.getSentence('mainWindow.title');
        // 自定义一个属性，用于判断是是否弹出退出提示
        this.isUploading = false;
        let startUrl = paths.productURL + 'build/index.html';
        if (process.env.ELECTRON_START_URL) {
            startUrl = process.env.ELECTRON_START_URL
        }

        this.windowParam = {
            show: false,
            //frame: false,
            backgroundColor: '#F6F9FF',
            resizable: true,
            // minWidth:1164,
            // minHeight:768
            minWidth: 1148,
            minHeight: 800,
            webPreferences: {
                webSecurity: false
            }
        };

        this.url = startUrl
        this.onCreated = this.onCreated.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onExitSystem = this.onExitSystem.bind(this);
        this.onLanguageChange = this.onLanguageChange.bind(this);
        //this.onUserLoginBtnClick = this.onUserLoginBtnClick.bind(this)
        //this.onLoginSucceed = this.onLoginSucceed.bind(this);
        //this.onWindowsWillNavigate = this.onWindowsWillNavigate.bind(this)
        this.onUploadFile = this.onUploadFile.bind(this);
        this.onDownloadFile = this.onDownloadFile.bind(this);
    }

    //窗口创建后被调用
    onCreated() {
        super.onCreated();
        console.log('mainWindow', 'windows main onCreated')
        desktop.addChannelEventListener(ChannelEventTypes.TO_EXIT_SYSTEM, this.onExitSystem);
        desktop.addChannelEventListener(ChannelEventTypes.TO_SWITCH_ACCOUNT, this.onSwitchAccount);
        //desktop.addWebContentsListener(this, desktop.TYPE_WEBCONTENT.WILL_NAVIGATE, this.onWindowsWillNavigate)
        //meumManager.appendUserLoginMeun2AppMeun(this.onUserLoginBtnClick);
        //MoudleDispatch.addEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange)
        //this.buildMenu();
        desktop.addChannelEventListener(ChannelEventTypes.TO_UPLOAD_FILE, this.onUploadFile);
        desktop.addChannelEventListener(ChannelEventTypes.TO_UPLOAD_SINGLES_FILE, this.onUploadSinglesFile);
        // desktop.addChannelEventListener(ChannelEventTypes.CANCEL_UPLOAD, this.onUploadFile);
        desktop.addChannelEventListener(ChannelEventTypes.TO_DOWNLOAD_FILE, this.onDownloadFile);
    }

    //窗口关闭安时被调用
    onClose() {
        // super.onClose();
        //desktop.removeAllWebContentsListener(this)
        //moudleDispatch.removeEventListener(DispatchEventTypes.LOGIN_SUCCEED, this.onLoginSucceed)

        desktop.removeChannelEventListener(ChannelEventTypes.TO_EXIT_SYSTEM, this.onExitSystem);
        desktop.removeChannelEventListener(ChannelEventTypes.TO_SWITCH_ACCOUNT, this.onSwitchAccount);
        //MoudleDispatch.removeEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange)

        desktop.removeChannelEventListener(ChannelEventTypes.TO_UPLOAD_FILE, this.onUploadFile);
        desktop.removeChannelEventListener(ChannelEventTypes.TO_UPLOAD_SINGLES_FILE, this.onUploadSinglesFile);
        desktop.removeChannelEventListener(ChannelEventTypes.TO_DOWNLOAD_FILE, this.onDownloadFile);
    }

    buildMenu() {
        //const menuConfig = require('../menuTemplate/globalMenu/otherMenu.js');
        //let menuConfigsArr = [menuConfig];
        //MenuFactory.buildMenu(this, menuConfigsArr);
    }

    /*onLanguageChange(languageEmunType) {
        desktop.dispatchChannelEvent(this, ChannelEventTypes.LANGUAGE_CHANGE, languageEmunType)
    }*/

    onExitSystem() {
        desktop.quitApp();
    }

    onSwitchAccount() {
        userAccount.clearAccountWithPromise().then(() => {
            const WindowManager = require('../../../framework/managers/windowsManager.js')
            WindowManager.showWindow(WindowsNamesKeys.LOGIN_WINDOW)
            let excludeWindowsNameArr = [WindowsNamesKeys.LOGIN_WINDOW];
            WindowManager.closeAllWindows(excludeWindowsNameArr)
        }).catch((err) => {
            console.log('mainWindow ', err);
        });
    }

    // 上传单个文件--这个param接受到的是个数组
    onUploadSinglesFile(event, param) {
        console.log(param, "------ting-uploadSingle--param---");
        console.log(event, "------ting-uploadSingle---event--");
        // 文件一个一个上传
        param.forEach(element => {

            const uploadParam = {
                bucket: element.bucket,
                paths: element.path
            }

            fileManager.uploadFiles([element.filepath], uploadParam).catch(err => {
                console.log(err, err.code);
                if(err.code == -1){
                    // 提示用户文件路径不存在
                    console.log("=====onUploadSinglesFile=== =======fail=====");
                    event.sender.send('NO_SUCH_FILE', {...element,err});
                }
            })
            const eveyTimeUploadList = fileManager.getAllUploadingFileInfoList().filter(item => {
                return item.state === 0;
            });
            event.sender.send(ChannelEventTypes.UP_LOAD_SINGLES_fILE_ALL, eveyTimeUploadList)
            // console.log('ipcMan-expeced-ting',allUploadFileCount);
            const timeID = setInterval(() => {
                event.sender.send(ChannelEventTypes.UP_LOAD_SINGLES_STATES, fileManager.getUploadingFileInfoList())
                // 准备好上传记录
                const uploadRecord = {
                    eveyTimeUploadList,
                    allUploadingFileInfoList: fileManager.getAllUploadingFileInfoList()
                };
                event.sender.send(ChannelEventTypes.UP_LOAD_SINGLES_File_RECORD, uploadRecord)
                 // 如果文件列表为空就取消信息上报
                if (fileManager.getUploadingFileInfoList().length === 0) {
                    // 整个上传的记录，必须等正在发完之后检查上传状态
                    event.sender.send(ChannelEventTypes.UP_LOAD_SINGLES_File_RECORD, uploadRecord)
                    clearInterval(timeID); 
                }
            }, 1500); //减小主进程上报频率--来减小渲染进程渲染频率，提升性能

        })

    }


    onUploadFile(event, param) {
        // console.log(event);
        // console.log(param);
        const { dialog } = require('electron');
        const properties = param.isDir ? ['openDirectory', 'multiSelections'] : ['openFile', 'multiSelections']
        dialog.showOpenDialog(this.win, { properties: properties }, (filePaths) => {
            // console.log(!filePaths, '<<<<<<<<<<<<filePaths>>>>>>>>>>');
            if (!filePaths || !filePaths.length) {
                return;
            }

            // 主程序发送一个打开哪个文件的目录
            event.sender.send(ChannelEventTypes.GET_OPEN_FILE_NAME, filePaths);

            // 一进入上传事件监听，就先移除COVER_UPLOAD主进程事件
            desktop.removeChannelEventAllListener(ChannelEventTypes.COVER_UPLOAD);
            // 在这里发一个主程序的事件监听
            desktop.addChannelEventListener(ChannelEventTypes.COVER_UPLOAD, (event, args) => {

                // 用户拒绝覆盖
                desktop.addChannelEventListener('CANCEL_UPLOAD', (event, args) => {
                    desktop.removeChannelEventAllListener(ChannelEventTypes.COVER_UPLOAD);
                })

                //确定上传前，获取上传列表中的总数
                if(args){
                    event.sender.send("UP_LOAD_START", fileManager.getAllUploadingFileInfoList())
                    console.log("<<<<<<<<<<<<<UP_LOAD_START>>>>>>>>>>>",fileManager.getAllUploadingFileInfoList().length);
                }
                // 主程序发送一个打开哪个文件的目录
                //  event.sender.send("GET_OPEN_FILE_NAME",filePaths);
                // 2018/11/26为了拿到上传详情而返回
                fileManager.uploadFiles(filePaths, param).then(res => {
                    console.log('全部上传成功');
                    event.sender.send("UP_LOAD_ALL_SUCCESS");
                }).catch(err => {
                    console.log('部分上传失败');
                    // 这个部分上传失败也给成功回调-是为了让文件即使没有全部上传成功也会更新页面
                    event.sender.send("UP_LOAD_ALL_SUCCESS");
                    
                });

            
                const eveyTimeUploadList = fileManager.getAllUploadingFileInfoList().filter(item => {
                    return item.state === 0;
                });
                
                event.sender.send(ChannelEventTypes.UP_LOAD_File_ALL, eveyTimeUploadList)
                // console.log('ipcMan-expeced-ting',allUploadFileCount);
                const timeID = setInterval(() => {
                    event.sender.send(ChannelEventTypes.UP_LOAD_STATES, fileManager.getUploadingFileInfoList())
                    // 如果文件列表为空
                    if (fileManager.getUploadingFileInfoList().length === 0) {
                        const uploadRecord = {
                            eveyTimeUploadList,
                            allUploadingFileInfoList: fileManager.getAllUploadingFileInfoList()
                        };
                        event.sender.send(ChannelEventTypes.UP_LOAD_File_RECORD, uploadRecord)
                        clearInterval(timeID);
                        // 整个上传的记录，必须等正在发完之后检查上传状态
                        console.log('all_upload================>');
                    }
                }, 500);

                desktop.removeChannelEventAllListener(ChannelEventTypes.COVER_UPLOAD);
            });

        })
    }

    onDownloadFile(event, param) {
        console.log(event);
        console.log(param);
        const { dialog } = require('electron');
        dialog.showOpenDialog(this.win, { properties: ['openDirectory'] }, (filePaths) => {
            if (!filePaths || !filePaths.length) {
                return;
            }
            const fileManager = require('../../../framework/managers/fileManager');
            fileManager.downloadFiles(filePaths, param).then(res => {
                console.log('全部下载成功');
                event.sender.send('DOWNLOAD_ALL_SUCCESS');
            }).catch(err => {
                console.log(err);
                console.log('部分下载失败');
                event.sender.send('DOWNLOAD_FAILED');
            });
            event.sender.send('DOWNLOAD_START');
        })
    }



    /*onWindowsWillNavigate( result ) {
        result.event.preventDefault();
    }*/

    /*onLoginSucceed(param){
        desktop.dispatchChannelEvent(this, ChannelEventTypes.LOGIN_SUCCEED)
    }*/

    /*onUserLoginBtnClick(menuItem, browserWindow, event) {
        const windowsManager = require('../../../framework/managers/windowsManager.js')
        let loginWindowName = require('../windows/loginWindow.js').WINDOW_NAME
        console.log('userLogin click')
        console.log(windowsManager)
        console.log(loginWindowName)
        windowsManager.showWindow(loginWindowName)
        //desktop.dispatchChannelEvent(this, ChannelEventTypes.LANGUAGE_CHANGE, 'zh')
    }*/
}

module.exports = {
    WINDOW_NAME: WindowsNamesKeys.MAIN_WINDOW, WINDOW_CLASS: WindowMain
}