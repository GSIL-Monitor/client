const desktop = require('../../../framework/adapter/desktopMainAdapter.js')
const WindowsNamesKeys = require('../common/windowsNameKeys.js')
const ChannelEventTypes = require('../common/channelEventTypes.js')
const paths = require('../../../paths.js')
const LanguageManager = require('../../../framework/managers/languageManager.js')
const config = require('../config/config.js')
const UserAccount = require('../store/userAccount.js')
const BaseWindow = require('./baseWindow.js')



class WindowLogin extends BaseWindow {

    constructor() {
        super();
        this.WINDOW_NAME = WindowsNamesKeys.LOGIN_WINDOW;
        this.width = 662;
        this.height = 442;
        //this.title = LanguageManager.getSentence('loginWindow.title');
        this.windowParam = {
            show: false,
            frame: false,
            backgroundColor: '#ffffff',
            resizable: false
        };
        let startUrl = paths.productURL + 'build/login.html';
        if (process.env.ELECTRON_START_URL) {
            startUrl = process.env.ELECTRON_START_URL + '/login.html'
        }

        this.url = startUrl
        //this.onCreated = this.onCreated.bind(this);
        //this.onClose = this.onClose.bind(this);
        //this.onLogin = this.onLogin.bind(this);
        this.onWindowsWillNavigate = this.onWindowsWillNavigate.bind(this)
        //this.onLanguageChange = this.onLanguageChange.bind(this);
    }


    onCreated() {
        super.onCreated();
        console.log('loginWindow:', 'windows onCreated')
        desktop.addWebContentsListener(this, desktop.TYPE_WEBCONTENT.WILL_NAVIGATE, this.onWindowsWillNavigate)
        desktop.addChannelEventListener(ChannelEventTypes.TO_CLOSE_LOGIN_WINDOW, this.onCloseWindow);
        desktop.addChannelEventListener(ChannelEventTypes.TO_MINUS_LOGIN_WINDOW, this.onMinusWindow);
        //MoudleDispatch.addEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange);
    }

    onClose() {
        super.onClose();
        desktop.removeAllWebContentsListener(this)
        desktop.removeChannelEventListener(ChannelEventTypes.TO_CLOSE_LOGIN_WINDOW, this.onCloseWindow);
        desktop.removeChannelEventListener(ChannelEventTypes.TO_MINUS_LOGIN_WINDOW, this.onMinusWindow);
        //MoudleDispatch.removeEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange)

    }

    onWindowsWillNavigate({ event, url }) {
        event.preventDefault();
        console.log('loginWindow:', 'url is ', url);
        let { protocol, baseURL } = config;
        let targetUrl = `${protocol}://${baseURL}/login/_tYYs_open_official_wx_L`;
        if (url.indexOf(targetUrl) === 0) {
            console.log('loginWindow:', 'user scan QR Code')
            UserAccount.requestLoginByQRCode({ url, protocol, baseURL }).then(() => {
                console.log('loginWindow:', 'login succeed ');
                this.onLoginSucceed();
            }).catch((err) => {
                console.log('loginWindow:', 'login error ');
                console.log(err);
            });
        }

    }

    /*onLanguageChange(languageEmunType){
        desktop.dispatchChannelEvent(this, ChannelEventTypes.LANGUAGE_CHANGE, languageEmunType)
    }*/

    onCloseWindow() {
        const WindowManager = require('../../../framework/managers/windowsManager.js')
        WindowManager.closeWindow(WindowsNamesKeys.LOGIN_WINDOW)
    }

    onMinusWindow() {
        const WindowManager = require('../../../framework/managers/windowsManager.js')
        WindowManager.minusWindow(WindowsNamesKeys.LOGIN_WINDOW)
    }

    onLoginSucceed() {
        const WindowManager = require('../../../framework/managers/windowsManager.js')
        WindowManager.showWindow(WindowsNamesKeys.MAIN_WINDOW)
        WindowManager.closeWindow(WindowsNamesKeys.LOGIN_WINDOW)
    }

    /*onLogin(event, arg){
        console.log('on login')
        const userAccount = require('../store/userAccount.js')
        userAccount.store(arg.token, arg.data).then(
            ()=>{
                console.log('login saved ok')
                moudleDispatch.dispatchEvent(DispatchEventTypes.LOGIN_SUCCEED);
                const windowManager = require('../../../framework/managers/windowsManager.js')
                windowManager.closeWindow(WindowsNamesKeys.LOGIN_WINDOW)
            }
        ).catch(
            (error)=>{
                console.log('login save error ', error)
            }
        )
    }*/
}

module.exports = {
    WINDOW_NAME: WindowsNamesKeys.LOGIN_WINDOW, WINDOW_CLASS: WindowLogin
}

