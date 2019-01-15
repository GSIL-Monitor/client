//创建菜单的辅助类

const electron = require('electron');
const platform = require('os').platform();  // 获取平台：https://nodejs.org/api/os.html#os_os_platform
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem

function appendUserLoginMeun2AppMeun(loginCallBack){
    let loginItem = new MenuItem({
        label: 'login',
        type: 'normal',
        click:loginCallBack
    })
    let menu = Menu.getApplicationMenu()
    if (menu) {
        let menuItem = new MenuItem({
            label: 'User',
            type: 'submenu',
            submenu: [loginItem]
        })
        menu.append(menuItem)
        Menu.setApplicationMenu(menu)
    } else {
        console.log('menu is empty');
        menu = new Menu()
        let menuItem = new MenuItem({
            label: 'User',
            type: 'submenu',
            submenu: [loginItem]
        })
        menu.append(menuItem)
        Menu.setApplicationMenu(menu)
    }
}

module.exports = {
    appendUserLoginMeun2AppMeun
}