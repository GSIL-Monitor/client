

function MenuFactory() {
    this.buildMenu = buildMenu;
}

/**
 * 
 * @param {BridgeWindow} BridgeWindow 自定义窗口,当为null时，设置全局菜单(mac)
 * @param {Array} platformTemplateConfigsArr 窗口的菜单模板Setting数组
 */
function buildMenu(bridgeWindow, platformTemplateConfigsArr) {
    const desktop = require('./desktopMainAdapter.js')
    let platfrom = desktop.getPlatform();
    const languageManager = require('../managers/languageManager.js')
    for (let i = 0; i < platformTemplateConfigsArr.length; ++i) {
        //处理特殊平台
        if (platformTemplateConfigsArr[i]['platf'] && platformTemplateConfigsArr[i]['platf'] === platfrom) {
            if (platfrom === 'darwin') {
                if(platformTemplateConfigsArr[i]['global']){
                    desktop.buildMenuTemplate(platformTemplateConfigsArr[i]['template'],languageManager,bridgeWindow, true)
                }else{
                    desktop.buildMenuTemplate(platformTemplateConfigsArr[i]['template'],languageManager,bridgeWindow, false)
                }   
            }
        }else if(!platformTemplateConfigsArr[i]['platf'] && !(platfrom === 'darwin')){
            desktop.buildMenuTemplate(platformTemplateConfigsArr[i]['template'],languageManager,bridgeWindow, false)
        }
    }
}



module.exports = new MenuFactory();