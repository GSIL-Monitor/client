const events = require('events');
const eventEmitter = new events.EventEmitter();

/**
 * 添加模块事件监听
 * @param {string} moudleEventType 
 * @param {function} callBackFunc 
 */
function addEventListener(moudleEventType, callBackFunc){
    eventEmitter.on(moudleEventType, callBackFunc)
}

/**
 * 移除模块事件监听
 * @param {string} moudleEventType 
 * @param {function} callBackFunc 
 */
function removeEventListener(moudleEventType, callBackFunc){
    eventEmitter.removeListener(moudleEventType, callBackFunc)
}

/**
 * 发送模块事件
 * @param {string} moudleEventType 
 * @param {Object} param 携带数据
 */
function dispatchEvent(moudleEventType, param = null){
    eventEmitter.emit(moudleEventType, param)
}

module.exports = {
    addEventListener,
    dispatchEvent,
    removeEventListener
}