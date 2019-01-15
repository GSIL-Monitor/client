const fs = require('fs');
const path = require('path');
const config = require('../../config');
// const COS = require('../../../../inner-cos-sdk/index');
const COS = require("./inner-cos-node-sdk");
const FILE_STATE = {
    PENDING: 0,
    SUCCESSED: 1,
    FAILED: 2,
}

class FileManager {

    constructor() {
        this.cos = new COS({
            AppId: config.cos.appId,
            SecretId: config.cos.secretId,
            SecretKey: config.cos.secretKey,
            AsyncLimit: 1,  //  文件并发数
            RetryTimes: 2,  //  get put delete 失败重试次数
            SliceRetryTimes: 2  //  sliceUploadFile 相关接口失败重试次数
        });
        this.uploadFileInfoList = [];
        this.downloadFileInfoList = [];
    }

    /**
     * 
     * @param {[String]} filepaths 本地上传文件的路径
     * @param {Object} param 项目参数
     * @param {String} param.bucket 存储桶   
     * @param {Array} param.paths 腾讯云文件路径列表. 例: ['a', 'b', 'c'] 表示上传至 a/b/c 目录下
     */
    uploadFiles(filepaths, param) {
        console.log('filepaths', filepaths);
        const cloudpaths = param.paths || [];
        const filenameList = [];
        let err;
        const resolveDir2Filename = (filepath1) => {
            let stats;
            if (fs.existsSync(filepath1)) {
                stats = fs.statSync(filepath1);
            } else {
                err = new Error('no such file or directory: ' + filepath1);
                err.code = -1;
                return;
            }
            if (stats.isFile()) {
                if (filepath1.indexOf('.DS_Store') == -1) { // Mac 目录结构文件
                    filenameList.push(filepath1);
                }
            } else if (stats.isDirectory()) {
                const files = fs.readdirSync(filepath1).filter(filename => {
                    return filename.indexOf('.DS_Store') == -1;
                });
                if (files.length == 0) {
                    filenameList.push(filepath1 + '/');
                } else {
                    files.forEach(filename => {
                        const filepath2 = path.join(filepath1, filename);
                        resolveDir2Filename(filepath2);
                    })
                }
            }
        }

        filepaths.forEach(filepath => {
            resolveDir2Filename(filepath);
        });

        if (err) {
            return Promise.reject(err);
        }

        const bucket = param.bucket;
        const excludeDirname = path.dirname(filepaths[0]);
        const uploadPromiseArray = [];
        filenameList.forEach(filepath => {
            //  腾讯云文件相对路径 + 本地文件相对路径
            const key = cloudpaths.slice().concat(filepath.substring(excludeDirname.length+1).replace(/\\/g, '/')).join('/');
            const param = {
                bucket: bucket,
                filepath: filepath,
                key: key
            }
            const promise = this._uploadFile(param);
            uploadPromiseArray.push(promise);
        });
        return Promise.all(uploadPromiseArray);
    }

    _uploadFile(param) {
        const fileInfo = {
            key: param.key,
            filepath: param.filepath,
            state: FILE_STATE.PENDING
        }
        this.uploadFileInfoList.push(fileInfo);

        return this.cos.sliceUploadFile({
            Bucket: param.bucket,
            Key: param.key,
            FilePath: param.filepath,
            onProgress: (data) => {
                console.log(data);
                fileInfo.progressInfo = data;
            },
        }).then(res => {
            fileInfo.state = FILE_STATE.SUCCESSED;
            console.log('FileManager success: ', fileInfo);
        }).catch(err => {
            fileInfo.state = FILE_STATE.FAILED;
            console.log('FileManager error: ', param.key, err);
            throw err;
        })
    }

    /**
     * 
     * @param {Object} param 项目参数
     * @param {String} param.bucket 存储桶
     * @param {[String]} param.keys 文件夹列表 
     * @param {Array} param.paths 腾讯云文件路径列表. 例: ['a', 'b', 'c'] 表示上传至 a/b/c 目录下   
     */
    uploadEmptyFolders(param) {
        const bucket = param.bucket;
        const paths = param.paths;
        const uploadPromiseArray = [];
        param.keys.forEach(folder => {
            //  腾讯云文件相对路径 + 本地文件相对路径
            const key = paths.concat(folder).join('/') + '/';
            const param = {
                bucket: bucket,
                key: key
            }
            const promise = this._uploadFile(param);
            uploadPromiseArray.push(promise);
        });
        return Promise.all(uploadPromiseArray);
    }

    /**
     * 
     * @param {[String]} filepaths 本地下载文件的路径
     * @param {Object} param 项目参数
     * @param {String} param.bucket 存储桶
     * @param {[String]} param.keys 文件名列表
     * @param {Array} param.paths 腾讯云文件路径列表. 例: 下载文件 a/b/c/d/e/test.txt 时, ['a', 'b', 'c'] 表示忽略 a/b/c, 只建立 d/e/test.txt 的目录结构     
     */
    downloadFiles(filepaths, param) {
        const savepath = filepaths[0];
        const keys = param.keys;
        const bucket = param.bucket;
        const excludePath = param.paths.reduce((a, b) => {
            return a + b + '/'
        }, '')
        const getBucketPromiseArray = [];
        keys.forEach(key => { //  选中文件/目录列表
            const promise = this.cos.getBucketAll({    //  获取其下所有文件
                Bucket: bucket,
                Prefix: key
            }).then(res => {
                const downloadPromiseArray = [];
                res.ListBucketResult.Contents.forEach(item => {
                    const fullkey = key + item.Key[0];
                    const savekey = fullkey.replace(excludePath, '');
                    const param = {
                        bucket: bucket,
                        key: fullkey,
                        filepath: savepath + '/' + savekey
                    }
                    /***
                     *  如果是文件夹(即文件名以'/'结尾的文件), 直接创建对应目录
                     */
                    if (/\/$/.test(param.filepath)) {
                        this.mkdirSync(param.filepath);
                        downloadPromiseArray.push(Promise.resolve());
                    } else {
                        this.mkdirSync(path.dirname(param.filepath));
                        const promise = this._downloadFile(param);
                        downloadPromiseArray.push(promise);
                    }
                })
                return Promise.all(downloadPromiseArray);
            }).catch(err => {
                console.log('downloadFiles', err);
                throw err;
            })
            getBucketPromiseArray.push(promise);
        })
        return Promise.all(getBucketPromiseArray);
    }

    _downloadFile(param) {
        const fileInfo = {
            key: param.key,
            filepath: param.filepath,
            state: FILE_STATE.PENDING
        }
        this.downloadFileInfoList.push(fileInfo);
        return this.cos.getObject({
            Bucket: param.bucket,
            Key: param.key,
            FilePath: param.filepath,
            onProgress: (data) => {
                console.log(data);
                fileInfo.progressInfo = data;
            },
        }).then(res => {
            fileInfo.state = FILE_STATE.SUCCESSED;
            // console.log('FileManager success: ', fileInfo);
        }).catch(err => {
            fileInfo.state = FILE_STATE.FAILED;
            console.log('FileManager error: ', param.key, err);
            throw err;
        })
    }

    getBucket(param) {
        console.log('getBucket', param);
        return this.cos.getBucketAll({
            Bucket: param.bucket,
            Prefix: param.prefix,
            Delimiter: param.delimiter,
            Marker: param.marker
        })
    }

    getUploadingFileInfoList() {
        return this.uploadFileInfoList.filter(file => {
            return file.state == FILE_STATE.PENDING
        })
    }
    getAllUploadingFileInfoList() {
        return this.uploadFileInfoList;
    }

    getDownloadingFileInfoList() {
        return this.downloadFileInfoList.filter(file => {
            return file.state == FILE_STATE.PENDING
        })
    }

    mkdirSync(dirname, callback) {
        const self = this;
        if (fs.existsSync(dirname)) {  
            callback && callback();  
        } else {
            self.mkdirSync(path.dirname(dirname), function () {  
                console.log('mkdirSync', dirname);
                fs.mkdirSync(dirname);
                callback && callback();  
            });  
        }  
    }

    /**
     * 
     * @param {Object} param 项目参数
     * @param {String} param.bucket 存储桶
     * @param {[String]} param.keys 文件名列表    
     */
    deleteFiles(param) {
        const getBucketPromiseArray = [];        
        param.keys.forEach(key => { //  选中文件/目录列表
            let promise;
            if (/\/$/.test(key)) {  //  文件夹与文件分开处理
                promise = this.cos.getBucketAll({    //  获取其下所有文件并删除
                    Bucket: param.bucket,
                    Prefix: key
                }).then(res => {
                    console.log('deleteFiles getBucket', res);
                    const deleteObjectPromiseArray = [];
                    res.ListBucketResult.Contents.forEach(item => {
                        const fullkey = key + item.Key[0];
                        const promise = this.cos.deleteObject({ 
                            Bucket: param.bucket,
                            Key: fullkey
                        }).then(res => {
                            console.log('delete success: ', fullkey);
                        }).catch(err => {
                            console.log('delete error: ', fullkey, err);
                            throw err;
                        })
                        deleteObjectPromiseArray.push(promise);
                    })
                    return Promise.all(deleteObjectPromiseArray);
                }).catch(err => {
                    console.log('deleteFiles getBucket', err);
                    throw err;
                })
            } else {
                promise = this.cos.deleteObject({ //  直接删除
                    Bucket: param.bucket,
                    Key: key
                }).then(res => {
                    console.log('delete success: ', key);
                }).catch(err => {
                    console.log('delete error: ', key, err);
                    throw err;
                })
            }
            getBucketPromiseArray.push(promise);
        })
        return Promise.all(getBucketPromiseArray);  
    }
}

module.exports = new FileManager();