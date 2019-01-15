import React, { Component } from 'react'
import { Layout, Button, Icon, Breadcrumb } from "antd";
import { Link } from 'react-router-dom';
import style from '../common/css/projectdetail.less';
import backgroundResolver from '../communication/backgroundResolver';
import FileComponent from '../components/FileComponent';
import FolderCreateComponent from '../components/FolderCreateComponent';
import eventproxy from 'react-eventproxy';
import ProgressPanel from '../components/progressPanel.js';
import ProgressDetailPanel from './progressDetailPanel.js';
import {confirm} from './confirm.js';
import toast from '../common/js/toast';
import EmptyComponent from '../components/EmptyComponent';
import {loading} from './LoadingControl';

const desktopRender = require('../../framework/adapter/desktopRenderAdapter');
const ChannelEventTypes = require('../../application/mainProcessBackGround/common/channelEventTypes.js');
const { Content } = Layout;

class ProjectDetailContainer extends Component {
    
    constructor(props) {
        super(props);
        let projectInfoStr = props.location.pathname.replace('/detail/', '');
        let projectInfo = JSON.parse(projectInfoStr);
        this.state = {
            projectInfo: projectInfo,
            fileList: [],
            selectedIndexs: [],
            paths: [],
            uploadFileCount:0,
            uploadFileCountAll:0,
            progressPercent: 0,
            allUpLoadRecord: null,
            isProgressShow: false,
            bucket:'',
            isSelectedAll: false,
            isFinished: true//用来确认是否还在上传中
        }
        this.onClickUpload = this.onClickUpload.bind(this);
        this.onClickDelete = this.onClickDelete.bind(this);
        this.onClickDownload = this.onClickDownload.bind(this);
        this.onClickBreadcrumbItem = this.onClickBreadcrumbItem.bind(this);
        this.didSelecteAtIndex = this.didSelecteAtIndex.bind(this);
        this.onClickFolderCreate = this.onClickFolderCreate.bind(this);
        this.onClickSelectAll = this.onClickSelectAll.bind(this);
        this.accMul = this.accMul.bind(this);
        console.log(props, projectInfo);
    }

    componentDidMount() {
        eventproxy.on('openFolder', (paths) => {
            this.setState({
                paths: paths
            })
            this.queryFileList(paths);
        })
        eventproxy.on('closeFolderCreate', (keys) => {
            this.setState({
                showFolderCreate: false
            })
            if (keys && keys.length > 0) {
                backgroundResolver.request('/uploadEmptyFolders', {
                    bucket: this.state.projectInfo.bucketName,
                    paths: this.state.paths,
                    keys: keys
                }).then(res => {
                    this.queryFileList(this.state.paths);
                    toast.show('创建成功', () => {
                        this.syncCosFile2Project();
                    })
                }).catch(err => {
                    console.log(err);
                })
            }
        })
        this.queryFileList([]);

         // 上传之前先确认文件目录名是否和已有的目录名重复OPEN_FILE_NAME
         // 对于打开对话框后获得--被打开文件夹事件的监听
         // 上传重复判断要支持文件多选的时候，整个上传列表也能和桶目录结构做比对
         desktopRender.addChannelEventListener('GET_OPEN_FILE_NAME',(event,arg)=>{
            //  如果单文件上传但是用了shift、ctrl多选上传，那么arg就是个数组
            // console.log(arg,'---====-判断重复用--------arg');

            const isStage = this.state.paths.length == 0;
            if (isStage) {
                let isInvalid = false;
                arg.forEach((item) => {
                    let folderComponents = item.replace(/\\/g, '/').split('/');
                    let targetFolder = folderComponents[folderComponents.length - 1];
                    isInvalid = (['项目与版权信息', '后期制作', '筹备立项', '成片物料', '拍摄阶段', '宣发物料'].indexOf(targetFolder) == -1)
                })
                if (isInvalid)  {
                    toast.show('文件夹名字不在标准名称范围内，请检查你的文件夹命名。 阶段文件夹的标准名称有：项目与版权信息、筹备立项、拍摄阶段、后期制作、成片物料、宣发物料');
                    return;
                }
            }  

            console.log('isRepeat arg', arg);
            console.log('isRepeat list', this.state.fileList);
            let isRepeat = false;
            arg.map((item) => {
                let uploadFile = item.replace(/\\/g, '/').split('/');
                let targetFile = uploadFile.slice(uploadFile.length-1,uploadFile.length);
                this.state.fileList.forEach(it=>{
                    if(it.key == targetFile){
                        isRepeat = true
                    }
                })
            })
            console.log(isRepeat,'---====-isRepeat----');
            if(isRepeat ){
                confirm({
                    title: '上传文件',
                    okTest: '确认',
                    cancelText: '取消',
                    msg: `文件或文件夹名称与现有文件或文件夹名称相同，重新上传将会覆盖原文件，确认继续吗？`,
                    onOk: () => {
                        // 上传之前先把进度条百分比设置成空
                        console.log("点击了确认");
                        // desktopRender.dispatchChannelEvent('COVER_UPLOAD', 'SAME_FILE');
                        desktopRender.dispatchChannelEvent('COVER_UPLOAD', this.state.isFinished);
                    },
                    onCancel: ()=>{
                        this.setState({
                            uploadFileCount: 0
                        })
                        desktopRender.dispatchChannelEvent('CANCEL_UPLOAD', true);
                    }
                });
            }
            // 没有重复就直接上传
            if(!isRepeat){
                // desktopRender.dispatchChannelEvent('COVER_UPLOAD', 'NO_SAME_FILE');
                desktopRender.dispatchChannelEvent('COVER_UPLOAD', this.state.isFinished);
            }
            
        })

        // 整体的上传记录（本次应用从打开到关闭的全部上传记录）
        desktopRender.addChannelEventListener('UP_LOAD_File_RECORD', (event, arg) => {
            console.log(arg, 'args--allUpLoadRecord-');
            this.setState({
                allUpLoadRecord: arg
            });
            // desktopRender.removeChannelEventAllListener('UP_LOAD_File_RECORD');
        });
        
        // 第一次开始上传的起始索引
        desktopRender.addChannelEventListener('UP_LOAD_START', (event, arg) => {
            console.log(arg, '<<<<<<<<<<<<<<<<args--UP_LOAD_START>>>>>-');
            this.setState({
               upLoadRecordStart: arg.length
            });
            // desktopRender.removeChannelEventAllListener('UP_LOAD_File_RECORD');
        });

        // 返回上传的所有文件
        desktopRender.addChannelEventListener('UP_LOAD_File_ALL', (event, arg) => {
            // console.log(arg,'args-ALL-count--');
            // 记录正在上传的文件个数
            this.setState({
                uploadFileCountAll: arg.length
            });

            loading.startLoading('正在上传...');
        });

        desktopRender.addChannelEventListener('UP_LOAD_STATES', (event, arg) => {
            // 显示进度条
            this.setState({
                isProgressShow: true
            });
            console.log(arg, 'args--上传的文件个数-', (this.state.uploadFileCountAll - this.state.uploadFileCount));
            // fixed 进度显示异常
            let progressNum = (this.state.uploadFileCountAll - arg.length) / this.state.uploadFileCountAll;
            // 转字符串解决显示59.9999999999%的问题
            let progressStr = new String(progressNum);
            let progressStrb = progressStr.slice(0,5);
            console.log(progressStrb,'===========progressStrb===========');
            let progressFloat = parseFloat(progressStrb);
            let progressPercent = this.accMul(progressFloat,100)
            console.log('上传进度百分比', progressPercent);
            // 记录正在上传的文件个数
            this.setState({
                uploadFileCount: arg.length,
                progressPercent: progressPercent
            });
            // 进度不为100,就代表还在上传中
            if(progressPercent != 100){
                this.setState({
                    isFinished: false
                })
            }else{
                this.setState({
                    isFinished: true
                })
            }

        });

        desktopRender.addChannelEventListener('UP_LOAD_ALL_SUCCESS', (event,arg)=>{
            this.queryFileList(this.state.paths);
            loading.stopLoading();
            toast.show('上传成功');
            this.syncCosFile2Project();
        });

        
        desktopRender.addChannelEventListener('DOWNLOAD_ALL_SUCCESS', (event,arg)=>{
            loading.stopLoading();
            toast.show('下载成功');
        });

        desktopRender.addChannelEventListener('DOWNLOAD_FAILED', (event,arg)=>{
            loading.stopLoading();
            toast.show('部分下载失败');
        });

        desktopRender.addChannelEventListener('DOWNLOAD_START', (event,arg)=>{
            loading.startLoading('正在下载...');
        });
    }

    componentWillUnmount() {
        console.log('componentWillUnmount');
        eventproxy.off('openFolder');

        // 统一移除事件
        desktopRender.removeChannelEventAllListener('GET_OPEN_FILE_NAME');
        desktopRender.removeChannelEventAllListener('UP_LOAD_File_ALL');
        desktopRender.removeChannelEventAllListener('UP_LOAD_STATES');
        desktopRender.removeChannelEventAllListener('UP_LOAD_ALL_SUCCESS');
        desktopRender.removeChannelEventAllListener('DOWNLOAD_ALL_SUCCESS');


        desktopRender.removeChannelEventAllListener('UP_LOAD_START');
    }

    queryFileList(paths) {
        backgroundResolver.request('/getBucket', {
            bucket: this.state.projectInfo.bucketName,
            prefix: paths.join('/') + '/',
            delimiter: '/',
            marker: ''
        }).then(({param}) => {
            this.convertArrayToObject(param);
        }).catch(err => {
            console.log(err);
        })
    }

    convertArrayToObject(param) {
        console.log('-----------🙃-1------------', Date.now());
        const CommonPrefixes = param.ListBucketResult.CommonPrefixes;
        const Contents = param.ListBucketResult.Contents;
        let prefixes = [];
        let contents = [];
        if (CommonPrefixes) {
            prefixes = CommonPrefixes.map(item => {
                return {
                    key: item.Prefix[0].replace('/', ''),
                    timestamp: 0,
                    isDir: true
                }
            })
        }
        if (Contents) {
            contents = Contents.map(item => {
                const key = item.Key[0];
                const lastchar = key[key.length -1];
                const isDir = lastchar == '/';  //  后缀为 '/' 当文件夹处理
                return {
                    key: item.Key[0].replace('/', ''),
                    timestamp: new Date(item.LastModified[0]).getTime(),
                    isDir: isDir
                }
            }).filter(item => { //  过滤空文件
                return item.key !== '';
            })
        }
        console.log('-----------🙃-2------------', Date.now());
        const stageList = ['项目与版权信息', '筹备立项', '拍摄阶段', '后期制作', '成片物料', '宣发物料'];
        const fileList = prefixes.concat(contents).sort((a, b) => {
            /***
             *  排序优先级
             *  1. 阶段文件夹按上述列表先后顺序
             *  2. 文件夹
             *  3. 文件
             *  4. 上传时间
             */
            const max = stageList.length;
            const indexA = stageList.indexOf(a.key) == -1 ? max : stageList.indexOf(a.key);
            const indexB = stageList.indexOf(b.key) == -1 ? max : stageList.indexOf(b.key);
            let res = 1;
            if (a.isDir == b.isDir) {
                if (indexA < indexB) {
                    res = -1;
                } else if (indexA > indexB) {
                    res = 1;
                } else if (a.timestamp > b.timestamp) {
                    res = -1;
                }
            } else if (a.isDir) {
                res = -1;
            }
            return res;
        });
        console.log(fileList);
        console.log('-----------🙃-3------------', Date.now());
        this.setState({
            fileList: fileList,
            selectedIndexs: [],
            isSelectedAll: false
        })
        eventproxy.trigger('isSelectedAll', false);
    }

    onClickFolderCreate() {
        this.setState({
            showFolderCreate: true
        })
    }
    

    onClickUpload(isDir) {
        console.log('onClickUpload', isDir);
        // 上传之前先把进度条百分比设置成空
        this.setState({
            // uploadFileCount:0,
            // uploadFileCountAll:0,
            // progressPercent: 0,
            // allUpLoadRecord: null,
            // isProgressShow: false
        });
        // console.log(this.state);
        const param = {
            bucket: this.state.projectInfo.bucketName,
            paths: this.state.paths,
            fileList: this.state.fileList,
            isDir: isDir
        }
        desktopRender.dispatchChannelEvent(ChannelEventTypes.TO_UPLOAD_FILE, param);
       
        this.setState({
            bucket: param.bucket
        });
        // console.log(param,"-------213--不同的桶-----param-----");   
    }

    syncCosFile2Project() {
        backgroundResolver.request('/syncProject', this.state.projectInfo.projectId).then(res => {
            console.log('syncProject success', res);
            toast.show('同步成功');
        }).catch(err => {
            console.log('syncProject error', err);
            toast.show('同步失败');
        })
    }

    // 解决浮点相乘的精度问题， 用在计算进度条进度上
    accMul(arg1,arg2){
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
    }

    onClickDelete() {
        confirm({
            title: '删除文件',
            okTest: '确认',
            cancelText: '取消',
            msg: `确认删除文件`,
            onOk: () => {
                console.log('onClickDelete');
                backgroundResolver.request('/deleteFiles', {
                    bucket: this.state.projectInfo.bucketName,
                    keys: this.state.selectedIndexs.map(index => {
                        let key = this.state.fileList[index].key;
                        key += this.state.fileList[index].isDir ? '/' : '';
                        let fullkey = this.state.paths.concat(key).join('/');
                        return fullkey;
                    })
                }).then(res => {
                    this.queryFileList(this.state.paths);
                    loading.stopLoading();
                    toast.show('删除成功', () => {
                        this.syncCosFile2Project();
                    });
                }).catch(err => {
                    console.log('删除失败');
                    loading.stopLoading();
                })
                loading.startLoading('正在删除...');
            }
        });
    }

    onClickDownload() {
        const param = {
            bucket: this.state.projectInfo.bucketName,
            keys: this.state.selectedIndexs.map(index => {
                let key = this.state.fileList[index].key;
                let fullkey = this.state.paths.concat(key).join('/');
                return fullkey;
            }),
            paths: this.state.paths
        }
        desktopRender.dispatchChannelEvent(ChannelEventTypes.TO_DOWNLOAD_FILE, param);
    }

    didSelecteAtIndex(index, isSelected) {
        console.log(index, isSelected);
        if (isSelected) {
            this.state.selectedIndexs.push(index);
        } else {
            let i = this.state.selectedIndexs.indexOf(index);
            this.state.selectedIndexs.splice(i, 1);
        }
        const isSelectedAll = (this.state.selectedIndexs.length == this.state.fileList.length);
        this.setState({
            selectedIndexs: this.state.selectedIndexs,
            isSelectedAll: isSelectedAll
        })
    }

    onClickSelectAll() {
        const isSelectedAll = !this.state.isSelectedAll
        const selectedIndexs = isSelectedAll ? this.state.fileList.map((item, index) => {
            return index;
        }): [];
        this.setState({
            selectedIndexs: selectedIndexs,
            isSelectedAll: isSelectedAll
        })
        eventproxy.trigger('isSelectedAll', isSelectedAll);
        console.log(selectedIndexs);
    }

    onClickBreadcrumbItem(index) {
        console.log('onClickBreadcrumbItem', index);
        switch (index) {
            case 0: {
                this.props.history.push('/');
            };
            default: {
                let paths = this.state.paths.slice(0, index-1);
                this.setState({
                    paths: paths,
                    fileList: []
                })
                this.queryFileList(paths);
            };
        }
    }

    render() {
        const routes = [
            {
                breadcrumbName: '全部'
            }, {
                breadcrumbName: this.state.projectInfo.projectName
            }
        ];

        this.state.paths.forEach(path => {
            routes.push({
                breadcrumbName: path
            })
        })

        const existFolders = this.state.fileList.filter(item => {
            return item.isDir;
        }).map(item => {
            return item.key;
        })

        const isStage = this.state.paths.length == 0;
        const folderCreateTitle = isStage ? '新建项目阶段' : '新建文件夹';

        const isNotEmpty = this.state.fileList.length > 0;
        const emptyText = `暂无文件`;

        const isVisible = this.state.selectedIndexs.length > 0;
        return(
            <Content className={style.content}>
                <Breadcrumb className={style.breadcrumb} separator={<Icon type='right'></Icon>}>
                    {
                        routes.map((route, index, routes) => {
                            let item;
                            if (index == routes.length-1) {
                                item = (<span>{route.breadcrumbName}</span>) 
                            } else {
                                item = (<a onClick={() => {this.onClickBreadcrumbItem(index)}}>{route.breadcrumbName}</a>)
                            }
                            return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                        })
                    }
                </Breadcrumb>
                <div className={style.line}></div>
                <div className={style.actions}>
                    <Button icon='file-add' onClick={this.onClickFolderCreate}>{folderCreateTitle}</Button>
                    {isStage ? '' : <Button icon='upload' onClick={() => {this.onClickUpload(false)}}>上传</Button>}
                    <Button icon='upload' onClick={() => {this.onClickUpload(true)}}>上传文件夹</Button>
                    <Button icon='check-circle' onClick={this.onClickSelectAll}>全选</Button>
                    {isVisible ? <Button icon='download' onClick={this.onClickDownload}>下载</Button> : ''}
                    {isVisible ? <Button icon='delete' onClick={this.onClickDelete}>删除</Button> : ''}
                </div>

                {
                    isNotEmpty ?
                    <ul className={style.filelist}>
                        {this.state.fileList.map((item, index) => {
                            return <FileComponent
                                paths={this.state.paths} 
                                fileInfo={item} 
                                index={index}
                                didSelecteAtIndex={this.didSelecteAtIndex} 
                                key={this.state.paths.concat(item.key).join('')}>
                            </FileComponent>
                        })}
                    </ul>
                    :
                    <EmptyComponent emptyText={emptyText}/>
                }
                
                {this.state.isProgressShow &&<ProgressPanel progressPercent={this.state.progressPercent} 
                uploadFileCounAll={this.state.uploadFileCountAll}
                uploadFileCount={this.state.uploadFileCount}
                allUpLoadRecord={this.state.allUpLoadRecord}
                uploadStart = {this.state.upLoadRecordStart}
                bucket={this.state.bucket}
                // 传出去一个查询桶内目录的方法
                queryFileList={this.queryFileList.bind(this,this.state.paths)}
                />}
                {
                    this.state.showFolderCreate ? <FolderCreateComponent isStage={isStage} existFolders={existFolders}></FolderCreateComponent> : ''
                }
            </Content>
        )
    }
}

export default ProjectDetailContainer;