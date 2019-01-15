//语言管理类
const StoreManager = require('../managers/localStorageManager.js')
const StoreKeys = require('../../application/mainProcessBackGround/common/storageKeys.js')

const languageTypeEnum = {
    CHINESE_SIMPLIFIED: 'zh-CN',
    CHINESE: 'zh',
    CHINESE_TRADITIONAL: 'zh-TW',
    ENGLISH: 'en'
}


class LanguageManager {

    constructor() {
        this.curLanguage = '';
        this.languageData = {}
        this.getCurLanguageWithPromise = this.getCurLanguageWithPromise.bind(this)
        this.setLanguage = this.setLanguage.bind(this)
    }


    /**
     * 设置当前语言
     * @param {string} languageType 
     * @return Promise resolve() reject(err)
     */
    setLanguage(languageType) {
        if (this.curLanguage === languageType) {
            return new Promise(function (resolve, reject) {
                if (resolve) {
                    resolve();
                }
            });
        }
        //todo 和具体的语言.js解耦
        switch (languageType) {
            case languageTypeEnum.CHINESE:
            case languageTypeEnum.CHINESE_SIMPLIFIED:
                this.languageData = require('../../application/mainProcessBackGround/language/zh-CN.js')
                break;
            case languageTypeEnum.ENGLISH:
                this.languageData = require('../../application/mainProcessBackGround/language/en.js')
                break;
            default:
                return new Promise(function (resolve, reject) {
                    if (reject) {
                        reject(new Error('miss language data'));
                    }
                });
        }
        this.curLanguage = languageType;
        return new Promise(function (resolve, reject) {
            StoreManager.store(StoreKeys.LANGUAGE, { languageEnumType: languageType }).then(() => {
                if (resolve) {
                    resolve();
                }
            }).catch((err) => {
                console.log(err)
                resolve();
            })
        });
    }


    /**
     * 获取当前语言
     * @return {Promise} resolve(languageEnumType)
     */
    getCurLanguageWithPromise() {
        let resultParam = this.curLanguage;
        return new Promise(function (resolve, reject) {
            if (!resultParam) {
                StoreManager.fetch(StoreKeys.LANGUAGE).then((language) => {
                    resolve(language.languageEnumType)
                }).catch((error) => {
                    console.log(error)
                    resolve('')
                })
            } else {
                resolve(resultParam)
            }
        });
    }

    /**
     * 获取支持语言的枚举
     * @return Object
     */
    getLanguageTypeEnum() {
        return languageTypeEnum;
    }

    /**
     * 获取对应翻译的文本
     * @param {string} key 文本的key值 
     */
    getSentence(key) {
        if (this.languageData[key]) {
            return this.languageData[key];
        }
        return '';
    }

    /**
     * 初始化
     * @param {string} defaultLanguageEnumType 默认语言
     * @return Promise resolve()
     */
    init(defaultLanguageEnumType) {
        let setLanguage = this.setLanguage;
        let getCurLanguageWithPromise = this.getCurLanguageWithPromise;
        return new Promise(function (resolve, reject) {
            getCurLanguageWithPromise().then((languageEmunType) => {
                if (!languageEmunType) {
                    setLanguage(languageTypeEnum.CHINESE).then(resolve).catch((err) => {
                        console.log('err')
                        resolve();
                    })
                } else {
                    setLanguage(languageEmunType).then(resolve).catch((err) => {
                        console.log('err')
                        resolve();
                    })
                }
            }).catch((err) => {
                console.log('err')
                resolve();
            });
        });
    }


}


module.exports = new LanguageManager()