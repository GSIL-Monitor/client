//用户账号
class UserAccount {



    constructor() {
        this.axios = require('../moudle/axios.js')
        this.token = ''
        this.uid = ''
        this.userName = '游客'
        this.userIcon = ''
        this.isAuth = 0
        this.getUserInfoWithPromise = this.getUserInfoWithPromise.bind(this)
        this.requestUserInfoFromInternet = this.requestUserInfoFromInternet.bind(this)
        this.store = this.store.bind(this)
    }


    getToken() {
        return this.token;
    }

    getUid() {
        return this.uid;
    }

    getUserName() {
        return this.userName;
    }

    getUserIcon() {
        return this.userIcon;
    }

    getIsAuth() {
        return this.isAuth;
    }

    /**
     * 获取用户数据
     * @return {Object} {uid:string, userName:string, userIcon:url, isAuth:number}
     */
    getUserInfo() {
        let data = { uid: this.getUid(), userName: this.getUserName(), userIcon: this.getUserIcon(), isAuth: this.getIsAuth() }
        return data;
    }

    /**
     * 储存token以及用户数据
     * @param {string} token 
     * @param {Object} data {uid:string, userName:string, userIcon:url, isAuth:number} 
     * @return Promise
     */
    store(token, data) {
        this.storeUserData(data)
        return this.storeUserToken(token)
    }

    /**
     * 储存用户数据
     * @param {Object} data {uid:string, userName:string, userIcon:url, isAuth:number} 
     */
    storeUserData(data) {
        this.uid = data.uid;
        this.userName = data.userName;
        this.userIcon = data.userIcon;
        this.isAuth = data.isAuth;
    }

    /**
     * 储存token
     * @param {string} token 
     * @return Promise
     */
    storeUserToken(token) {
        this.token = token
        const storeManager = require('../../../framework/managers/localStorageManager.js')
        const StoreKeys = require('../common/storageKeys.js')
        return new Promise(function (resolve, reject) {
            storeManager.store(StoreKeys.TOKEN, token).then(
                resolve
            ).catch(
                reject
            )
        });

    }

    /**
     * 处理本地获取用户数据的请求
     * @return {Promise} resolve(resultParam) resultParam {uid:string, userName:string, userIcon:url, isAuth:number} 
     */
    getUserInfoWithPromise() {
        let data = this.getUserInfo();
        return new Promise(function (resolve, reject) {
            let resultParam = { data }
            resolve(resultParam)
        });
    }

    /**
     * 清除账户信息
     * @return {Promise} resolve() reject(err)  
     */
    clearAccountWithPromise(){
        const storeManager = require('../../../framework/managers/localStorageManager.js')
        const StoreKeys = require('../common/storageKeys.js')
        return new Promise(function(resolve, reject){
            storeManager.remove(StoreKeys.TOKEN).then(resolve).catch(reject);
        });
    }



    /**
     * 二维码扫码登陆
     * @param {string} url 请求登陆的目标url以及参数 
     */
    requestLoginByQRCode({ url, protocol, baseURL }) {
        let axios = this.axios;
        let requestUserInfoFromInternet = this.requestUserInfoFromInternet;
        let store = this.store;
        return new Promise(function (resolve, reject) {
            axios.get(url).then(res => {
                if (res.status == 200) {
                    let { token } = res.data;
                    requestUserInfoFromInternet({ token, protocol, baseURL }).then((data) => {
                        store(token, data).then(resolve).catch(resolve)
                    }).catch((err) => {
                        reject(err)
                    });
                } else {
                    reject(err)
                }
            })
        });
    }


    requestUserInfoFromInternet({ token, protocol, baseURL }) {
        const { GraphQLClient } = require('graphql-request')
        let getUserInfoUrl = `${protocol}://${baseURL}/api/official`;
        const tfClient = new GraphQLClient(getUserInfoUrl, {
            headers: {
                Authorization: token
            }
        });
        return new Promise(function (resolve, reject) {
            tfClient.request(`
              {
                  getUserInfo{
                      uid
                      nickname
                      portrait
                  }
              }`)
                .then(function (data) {
                    console.log('user gql result succeed');
                    let userData = { uid: data.getUserInfo.uid, userName: data.getUserInfo.nickname, userIcon: data.getUserInfo.portrait, isAuth: 1 }
                    resolve(userData)
                })
                .catch(function (err) {
                    console.log('user gql result error ');
                    reject(err)
                });
        });
    }
}



module.exports = new UserAccount();