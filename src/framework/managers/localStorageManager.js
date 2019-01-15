const storage = require('electron-json-storage')
const crypto = require('crypto');

/**
* 储存数据
* @param key {string} 数据储存对应的键值
* @param jsonObject {json Object} 要储存的数据
* @return Promise resolve(),errorCallback(error)
*/
function store(key, jsonObject) {
    return new Promise(function (resolve, reject) {
        storage.set(key, jsonObject, function (error) {
            if (error) {
                reject(error)
            } else {
                if (resolve)
                    resolve()
            }
        });
    });
}

/**
* 储存数据
* @param key {string} 数据储存对应的键值
* @return Promise resolve(data),errorCallback(error)
*/
function fetch(key) {
    return new Promise(function (resolve, reject) {
        storage.get(key, function (error, data) {
            if (error) {
                reject(error)
            } else {
                resolve(data);
            }
            //console.log(data);
        });
    });
}

/**
* 判断是否存有数据
* @param key {string} 数据储存对应的键值
* @return Promise resolve(boolean),errorCallback(error)
*/
function has(key) {
    return new Promise(function (resolve, reject) {
        storage.has(key, function (error, hasKey) {
            if (error) {
                reject(error)
            } else {
                resolve(hasKey ? true : false)
            }
        });
    });
}

/**
* 删除存有数据
* @param key {string} 数据储存对应的键值
* @return Promise [resolve()],errorCallback(error)
*/
function remove(key) {
    return new Promise(function (resolve, reject) {
        storage.remove(key, function (error) {
            if (error) {
                reject(error)
            } else {
                if (resolve)
                    resolve()
            }
        });
    });
}



/**
* 储存数据
* @param key {string} 数据储存对应的键值
* @param jsonObject {json Object} 要储存的数据
* @return Promise resolve(),errorCallback(error)
*/
function secureStore(key, jsonObject) {
    key = encryptAES(key)
    jsonObject = encryptAES(jsonObject)
    return new Promise(function (resolve, reject) {
        storage.set(key, jsonObject, function (error) {
            if (error) {
                reject(error)
            } else {
                if (resolve)
                    resolve()
            }
        });
    });
}

/**
* 储存数据
* @param key {string} 数据储存对应的键值
* @return Promise resolve(data),errorCallback(error)
*/
function secureFetch(key) {
    return new Promise(function (resolve, reject) {
        storage.get(key, function (error, data) {
            if (error) {
                reject(error)
            } else {
                resolve(decryptAES(data));
            }
        });
    });
}

/**
* 判断是否存有数据
* @param key {string} 数据储存对应的键值
* @return Promise resolve(boolean),errorCallback(error)
*/
function secureHas(key) {
    key = encryptAES(key)
    return new Promise(function (resolve, reject) {
        storage.has(key, function (error, hasKey) {
            if (error) {
                reject(error)
            } else {
                resolve(hasKey ? true : false)
            }
        });
    });
}

/**
* 删除存有数据
* @param key {string} 数据储存对应的键值
* @return Promise [resolve()],errorCallback(error)
*/
function secureRemove(key) {
    key = encryptAES(key)
    return new Promise(function (resolve, reject) {
        storage.remove(key, function (error) {
            if (error) {
                reject(error)
            } else {
                if (resolve)
                    resolve()
            }
        });
    });
}

/**
 * HashMD5转换
 * @param input {string} 待转换的内容
 * @returns {string} 返回MD5结果
 */
function HashMD5(input) {
    let ret = crypto.createHash('md5').update(input.toString()).digest("hex");
    return ret;
}

/**
 * AES加密
 * @param input {json object} 待加密的内容
 * @returns {string} 返回加密后的内容
 */
function encryptAES(input) {
    input = JSON.stringify(input)
    let iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var cipher = crypto.createCipheriv('aes-256-ecb', getTempKey(), iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(input, clearEncoding, cipherEncoding));
    cipherChunks.push(cipher.final(cipherEncoding));
    return cipherChunks.join('');
}

/**
 * AES解密
 * @param input {string} 加密后的内容
 * @returns {json object} 返回解密后的内容
 */
function decryptAES(input) {
    if (!input) {
        return {};
    }
    let iv = "";
    var clearEncoding = 'utf8';
    var cipherEncoding = 'base64';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-256-ecb', getTempKey(), iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(input, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));
    return JSON.parse(cipherChunks.join(''));
}

function getTempKey() {
    return HashMD5(
        "{" + "8" + "9" + "6" + "F" + "C" + "6" + "A" + "3" + "-" + "D" + "7" + "6" +
        "D" + "-" + "4" + "B" + "9" + "8" + "-" + "9" + "4" + "6" + "E" + "-" + "F" +
        "5" + "9" + "2" + "B" + "E" + "5" + "6" + "5" + "A" + "1" + "5" + "}");
}

module.exports = {
    store, fetch, secureStore, secureFetch, HashMD5, remove
}





