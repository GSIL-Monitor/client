import React, { Component } from 'react'
import { Icon, Button, Table, Input, InputNumber, Popconfirm, Form,message } from "antd";
import style from '../common/css/progressDetailPanel.less';
import filetype from '../common/js/filetype.js'
import { confirm } from './confirm.js'
const desktopRender = require("../../framework/adapter/desktopRenderAdapter");
const ChannelEventTypes = require('../../application/mainProcessBackGround/common/channelEventTypes.js')

class ProgressDetailPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.failList || [],
            columns: [{
                title: '文件名',
                dataIndex: 'filename',
            }, {
                title: '状态',
                dataIndex: 'state',
            }, {
                title: '操作',
                dataIndex: 'operation',
            }],
            // 指定选中项的 key 数组，需要和 onChange 进行配合
            selectedRowKeys: [],
            //单个文件上传，
            isSelectedAll: false
        }
        this.reupLoad = this.reupLoad.bind(this);
        this.getUploadParamList = this.getUploadParamList.bind(this);
        this.onClickClose = this.onClickClose.bind(this);
        this.reupLoadSingle = this.reupLoadSingle.bind(this)
    }

    componentDidMount(){
        //这几个回调功能还是单个文件上传--》其实暂时没用到，后期改进修复
        desktopRender.addChannelEventListener('UP_LOAD_SINGLES_fILE_ALL', (event, arg) => {
            // console.log(arg,'UP_LOAD_SINGLES_fILE_ALL---全部单个上传文件');
        });
        desktopRender.addChannelEventListener('UP_LOAD_SINGLES_STATES', (event, arg) => {
            // console.log(arg,'UP_LOAD_SINGLES_STATES---全部上传文件状态');
        });
        // UP_LOAD_SINGLES_File_RECORD
        desktopRender.addChannelEventListener('UP_LOAD_SINGLES_File_RECORD', (event, arg) => {
            // console.log(arg, 'UP_LOAD_SINGLES_File_RECORD-----全部上传文件记录');
            // key完全一样就是同一个文件（不同文件不可能拥有同样的路径）
            // 比较上传之前之后的数据，然后更新对应的数据
            const eveyTimeUploadList = arg.eveyTimeUploadList;
            let uploadList = this.state.data.map(item => {
                for (let i = 0; i < eveyTimeUploadList.length; i++) {
                    if (item.key === eveyTimeUploadList[i].key) {
                        item.state = eveyTimeUploadList[i].state;
                    }
                }
                return item;
            })
            // 更新数组后，修改state中data来改变页面渲染
            console.log(uploadList, 'uploadList----');
            this.setState({
                data: uploadList
            });
      
        });

        // 文件不存在的错误监听
        desktopRender.addChannelEventListener('NO_SUCH_FILE', (event, arg) => {
            console.log(arg,'NO_SUCH_FILE---文件找不到');
            message.warning(arg.filepath+" ，文件不存在！");
        });


    }

    componentWillUnmount(){
        desktopRender.removeChannelEventAllListener('UP_LOAD_SINGLES_fILE_ALL')
        desktopRender.removeChannelEventAllListener('UP_LOAD_SINGLES_STATES')
        desktopRender.removeChannelEventAllListener('UP_LOAD_SINGLES_File_RECORD')
        desktopRender.removeChannelEventAllListener('NO_SUCH_FILE')
    }

    onSelectChange = (selectedRowKeys) => {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    }

    // 点击关闭，提示用户
    onClickClose(e) {
        // console.log('>>>点击了关闭>  >>',this.state.data);
        let isComfirm = false;
        if (this.state.data.length > 0) {
            this.state.data.map(item => {
                if (item.state == 0) {
                    isComfirm = true;
                    
                } else {
                    // this.props.isShowDetailPanel();
                }
            });
            if(isComfirm){
                confirm({
                    title: '上传文件',
                    okTest: '确认',
                    cancelText: '取消',
                    msg: `中途退出将无法继续上传，确定退出？`,
                    onOk: () => {
                        console.log("点击了确认");
                        this.props.isShowDetailPanel();
                    }
                });
            }else{
                this.props.isShowDetailPanel();
            }
        } else {
            this.props.isShowDetailPanel();
        }
    }

    // 获取需要上传的文件参数列表
    getUploadParamList() {
        // 文件一个一个个上传，需要参数列表
        let paramList = [];
        // 根据selectedRowKeys找到对应的需要上传的文件
        const reuploadList = []
        let filepath = '';
        let path = []

        for (let j = 0; j < this.state.data.length; j++) {
            for (let i = 0; i < this.state.selectedRowKeys.length; i++) {
                if (j == this.state.selectedRowKeys[i]) {
                    reuploadList.push(this.state.data[j]);
                    this.setState({
                        data: this.state.data.map((item,index)=>{
                            if(j==index){
                                item.state = 0;
                            }
                            return item;
                        })
                    })
                    filepath = this.state.data[j].filepath;
                    // 要把path处理成上传需要的格式： 例: ['a', 'b', 'c'] 表示上传至 a/b/c 目录下
                    let pathArray = this.state.data[j].key.split('/');
                    path = pathArray.slice(0, pathArray.length - 1);
                    paramList.push({
                        bucket: this.props.bucket,
                        path: path,
                        filepath,
                        uploadFile: this.state.data[j]
                    })
                }
            }
        }
        // 根据对应需要上传的文件整理好上传方法需要的参数(path和filename)
        // console.log(reuploadList,'<<<<reuploadList<<<');
        // console.log(paramList,'<<<<reuploadList<<<');
        return paramList;
    }
    reupLoad() {
        // console.log('>>>reupLoad>>>');
        // console.log(this.props.bucket,this.state.selectedRowKeys);
        // console.log('<<<<reupLoad<<<');
        const paramsList = this.getUploadParamList();
        // 重新调用上传文件的主进程方法TO_UPLOAD_SINGLES_FILE
        console.log(paramsList, "--->>>paramsList");
        desktopRender.dispatchChannelEvent(ChannelEventTypes.TO_UPLOAD_SINGLES_FILE, paramsList);
    }

    reupLoadSingle(selectedIndex){
        //如果被选中才去重新上传 
        console.log(selectedIndex,'========index====');
        console.log(this.state.selectedRowKeys,'=====selectedRowKeys======');
        if(this.state.selectedRowKeys.indexOf(selectedIndex)> -1){
            // 重新上传
            // 文件一个一个个上传，需要参数列表
            let param = [];
            // 根据selectedRowKeys找到对应的需要上传的文件
            let filepath = '';
            let path = []

            for (let j = 0; j < this.state.data.length; j++) {
                for (let i = 0; i < this.state.selectedRowKeys.length; i++) {
                    if (j == this.state.selectedRowKeys[i] && selectedIndex ==this.state.selectedRowKeys[i] ) {
             
                        this.setState({
                            data: this.state.data.map((item,index)=>{
                                if(j==index){
                                    item.state = 0;
                                }
                                return item;
                            })
                        })
                        filepath = this.state.data[j].filepath;
                        // 要把path处理成上传需要的格式： 例: ['a', 'b', 'c'] 表示上传至 a/b/c 目录下
                        let pathArray = this.state.data[j].key.split('/');
                        path = pathArray.slice(0, pathArray.length - 1);
                        param.push({
                            bucket: this.props.bucket,
                            path: path,
                            filepath
                        })
                    }
                }
            }

            console.log(param,'======param=====');
            desktopRender.dispatchChannelEvent(ChannelEventTypes.TO_UPLOAD_SINGLES_FILE, param);

        }else{
            return ;
        }
        
    }

    render() {

        let newDate = [];
        if (this.props.failList) {
            this.props.failList.map((item, i) => {
                const upFilename = item.key.substring(item.key.lastIndexOf("/") + 1, item.key.length)
                // className={`icon ${style.iconfont}`}
                // 
                const iconClass = filetype.getIconClass(upFilename, false);
                const successIcon = (<div ><svg className='icon iconfont' aria-hidden="true">
                    <use xlinkHref={`#icon-success`}></use>
                </svg>上传成功</div>);
                const failIcon = (<div ><svg className='icon iconfont' aria-hidden="true">
                    <use xlinkHref={`#icon-jinggao1`}></use>
                </svg>上传失败</div>)
                const pending = (<div><svg style={{color:'#ffae6d'}} className='icon iconfont' aria-hidden="true">
                    <use xlinkHref={`#icon-retry`}></use>
                </svg>正在上传</div>)

                newDate.push({
                    key: i,
                    filename: (<div ><svg className='icon iconfont' aria-hidden="true">
                        <use xlinkHref={`#icon-${iconClass}`}></use>
                    </svg>{upFilename}</div>),
                    state: (item.state == 1 ? successIcon : (item.state == 2 ? failIcon: pending)),
                    operation: (item.state == 2 && <div className='reload'><Icon type="reload" /><div onClick={this.reupLoadSingle.bind(this,i)}>重新上传</div></div>)
                })

            });
        }
        console.log(newDate, 'newDate--');
        console.log(this.props.bucket, '-progressDetail-bucket--');

        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [{
                key: 'all-data',
                text: '全选',
                onSelect: () => {
                    if(!this.state.isSelectedAll){
                        this.setState({
                            selectedRowKeys: [...Array(this.props.failList.length).keys()], // 根据失败列表的长度
                            // selectedRowKeys: [...Array(46).keys()], // 0...45   
                            isSelectedAll: true
                        });
                    }else{
                        this.setState({
                            selectedRowKeys: [...Array(0).keys()], // 根据失败列表的长度
                            isSelectedAll: false
                        });
                    }
                    
                },
            }],
            onSelection: this.onSelection,
            onSelect: (record, selected, selectedRows, nativeEvent)=>{
                console.log(record,'===record==');
                const key = record.key;
                
            }
        };
        return (
            <div className={style.detailPanel}>
                <div className={style.hide}>
                    <a onClick={this.props.isShowDetailPanel} ><Icon type="minus" style={{ color: '#000' }} /></a>
                    <a onClick={this.onClickClose} ><Icon type="close" style={{ color: '#000' }} /></a>
                </div>

                <div className={style.title}>
                    <h3>上传详情</h3>
                </div>
                <Button onClick={this.reupLoad}>全部重新上传</Button>
                <Table columns={this.state.columns} rowSelection={rowSelection} dataSource={newDate} pagination={{ defaultPageSize: 5 }} />
            </div>
        );
    }
}

export default ProgressDetailPanel;