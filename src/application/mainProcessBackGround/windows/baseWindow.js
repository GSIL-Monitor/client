//BridgeWindow基类
const desktop = require('../../../framework/adapter/desktopMainAdapter.js')
const MoudleDispatch = require('../../../framework/managers/moudleDispatch.js')
const DispatchEventTypes = require('../common/dispatchEventTypes.js')
const ChannelEventTypes = require('../common/channelEventTypes.js')

class BaseBridgeWindow {
    constructor() {
        this.onCreated = this.onCreated.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onLanguageChange = this.onLanguageChange.bind(this);
    }

    onLanguageChange(languageEmunType){
        desktop.dispatchChannelEvent(this, ChannelEventTypes.LANGUAGE_CHANGE, languageEmunType)
        this.buildMenu();
    }

    onCreated() {
        this.buildMenu();
        MoudleDispatch.addEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange);
    }
    
    onClose() {
        MoudleDispatch.removeEventListener(DispatchEventTypes.LANGUAGE_CHANGE, this.onLanguageChange)
    }

    buildMenu(){

    }
}




module.exports = BaseBridgeWindow;