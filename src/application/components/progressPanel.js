import React, { Component } from 'react'
import { Progress , Icon, Button } from "antd";
import style from '../common/css/progressPanel.less'
import ProgressDetailPanel from '../containers/progressDetailPanel.js'


class ProgressPanel extends Component{
    constructor(props){
        super(props);
        this.state = {
            isShowDetail: false
        }
        this.isShowDetailPanel = this.isShowDetailPanel.bind(this);
    }
    isShowDetailPanel(){
        this.setState({
            isShowDetail: !this.state.isShowDetail
        })
    }

    render(){
        let successNumber = 0;
        let failNumber = 0;
        let failList = [];
        let successList = [];
        if(this.props.allUpLoadRecord){
            const eveyTimeUploadList = this.props.allUpLoadRecord.eveyTimeUploadList || 0;
            const allUploadingFileInfoList = this.props.allUpLoadRecord.allUploadingFileInfoList;
            // 裁剪数组的起始索引，要确保为正数
            // const start = allUploadingFileInfoList.length  - eveyTimeUploadList.length >0 ? allUploadingFileInfoList.length  - eveyTimeUploadList.length : 0  ;
            // 为了保证上传途中多次上传，最后总数的正确性，重新定义start
            const start = this.props.uploadStart;
            const end = allUploadingFileInfoList.length;
            console.log("start-end-");
            console.log(start,end);
            allUploadingFileInfoList.slice(start, end).forEach(element => {
                if (element.state === 1) {
                    successNumber++;
                    successList.push(element)
                } else if (element.state === 2 || element.state === 0) {
                    failNumber++;
                    failList.push(element);
                }
            });
            console.log(successNumber+"successNumber",failNumber+"failNumber");
            console.log(successList,failList);
        }
        

        const warningIcon = (<div ><svg className='icon iconfont' aria-hidden="true">
            <use xlinkHref={`#icon-waring`}></use>
        </svg></div>);
        return (
            
            <div>
                {this.props.progressPercent === 100 ?(
                    <div className={style.progressResultPanel}>
                        <div className={style.leftPanel}>
                            <Icon type="check-circle" />
                            <span >成功上传{successNumber}份文件</span>
                        </div>
                        <div className={style.rightPanel}>
                            <Icon type="warning" />
                            <span >{failNumber}份文件上传失败</span>
                            {failList.length>0 && <Button onClick={this.isShowDetailPanel}>查看详情</Button>}
                        </div>
                </div>  )
                :
                ( <div className={style.progressPanel}>
                    <div className={style.panelTop}>
                        <Icon type="sync" spin />
                        <span >还剩{this.props.uploadFileCount}份文件正在上传中......</span>
                    </div>


                    <Progress  percent={this.props.progressPercent} />
                </div>)
                }

                {this.state.isShowDetail && successList&& <ProgressDetailPanel bucket={this.props.bucket} isShowDetailPanel={this.isShowDetailPanel} failList={failList}  queryFileList={this.props.queryFileList}/>}
            </div>
           
        );
    }
}

export default ProgressPanel