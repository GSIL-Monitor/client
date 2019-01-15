const { ipcMain } = require('electron')
const stringify = require('../../application/common/js/stringify');
//本地请求函数处理模块
class BackgroundProvider {

  constructor() {
    this.url2MoudleFunctionMap = {};
    this.url2MoudleSynchronizeFunctionMap = {};


    ipcMain.on('backgroundRequest', (event, url, param) => {
      this.parseRequest(event.sender, url, param)
    })

    ipcMain.on('backgroundSyncRequest', (event, url, param) => {
      this.parseSyncRequest(event, url, param)
    })
  }

  /**
  * 
  * @param {string} url 请求地址
  * @param {function} moudleFunction 异步处理函数，必须返回Promise,resolver接受一个参数传递数据
  */
  addMoudleMap(url, moudleFunction) {
    if (this.url2MoudleFunctionMap[url]) {
      console.log('duplicate moudle map')
    }
    this.url2MoudleFunctionMap[url] = moudleFunction;
  }

  parseRequest(sender, url, param) {
    const responseUrl = 'backgroundResponse' + url + stringify(param)
    if (this.url2MoudleFunctionMap[url]) {
      this.url2MoudleFunctionMap[url](param).then(
        (resultParam) => {
          // console.log('prepare to send param ', responseUrl, resultParam)
          console.log('prepare to send param ', responseUrl)
          sender.send(responseUrl, url, resultParam)
        }
      ).catch(
        (err) => {
          console.log(err)
          let resultParam = {};
          resultParam.err = err;
          sender.send(responseUrl, url, resultParam)
        }
      );
    } else {
      let err = new Error('miss moudle function map');
      let resultParam = {};
      resultParam.err = err;
      sender.send(responseUrl, url, resultParam)
    }
  }



  /**
   * 
   * @param {string} url 请求地址
   * @param {function} moudleFunction 异步处理函数，必须返回Promise,resolver接受一个参数传递数据
   */
  addMoudleMapSync(url, moudleFunction) {
    if (this.url2MoudleSynchronizeFunctionMap[url]) {
      console.log('duplicate moudle map')
    }
    this.url2MoudleSynchronizeFunctionMap[url] = moudleFunction;
  }


  parseSyncRequest(event, url, param) {
    if (this.url2MoudleSynchronizeFunctionMap[url]) {
      this.url2MoudleSynchronizeFunctionMap[url](param).then(
        (resultParam) => {
          console.log('prepare to send param ', resultParam)
          event.returnValue = resultParam
        }
      ).catch(
        (err) => {
          console.log(err)
          let resultParam = {};
          resultParam.err = err;
          event.returnValue = resultParam;
        }
      );
    } else {
      let err = new Error('miss moudle function map');
      let resultParam = {};
      resultParam.err = err.message;
      event.returnValue = resultParam;
    }
  }


}



module.exports = new BackgroundProvider();