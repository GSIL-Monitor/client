import React, { Component } from 'react';
import { Button, Icon, Input } from 'antd';
import style from '../common/css/foldercreate.less';
import eventproxy from 'react-eventproxy';
import toast from '../common/js/toast';

class FolderCreateComponent extends Component {

    constructor(props) {
        super(props);
        const options = ['项目与版权信息', '后期制作', '筹备立项', '成片物料', '拍摄阶段', '宣发物料'];
        const disabled = options.map((item) => {
            return props.existFolders.includes(item);
        })
        this.state = {
            isStage: props.isStage,
            options: options,
            selected: [false, false, false, false, false, false],
            disabled: disabled
        }
    }

    didSelectAtIndex(index) {
        if (this.state.disabled[index]) { return };
        const selected = this.state.selected;
        selected[index] = !selected[index];
        this.setState({
            selected: selected
        })
    }

    onClickConfirm() {
        let keys = [];
        if (this.state.isStage) {
            keys = this.state.options.filter((item, index) => {
                return this.state.selected[index];
            })
            eventproxy.trigger('closeFolderCreate', keys);
        } else {
            const value = document.querySelector('#folderCreateInput').value || '';
            const trimed = value.replace(/\s/g, '');
            if (trimed == '') {
                toast.show('请输入有效文件夹名');
            } else {
                value && value.length > 0 && (keys = [value]);
                eventproxy.trigger('closeFolderCreate', keys);
            }
        }
    }

    onClickClose() {
        eventproxy.trigger('closeFolderCreate');
    }

    render() {
        const title = this.state.isStage ? '创建新阶段' : '新建文件夹';
        let btnDisabled = false;
        if (this.state.isStage) {
            btnDisabled = !(this.state.disabled.indexOf(false) != -1) || !(this.state.selected.indexOf(true) != -1);
        } else {
            //  TODO
        }
        return (
            <div className={style.container}>
                <Icon className={style.close} type='close' onClick={() => {this.onClickClose()}}></Icon>
                <h4 className={style.title}>{title}</h4>
                {   this.state.isStage ?
                    <ul className={style.options}>
                    {
                        this.state.options.map((option, index) => {
                            const isSelected = this.state.selected[index];
                            const isDisabled = this.state.disabled[index];
                            const classname = isDisabled ? 'radio disabled' : (isSelected ? 'radio selected' : 'radio')
                            return (
                                <li key={option}>
                                    <div className={classname} onClick={(e) => {this.didSelectAtIndex(index)}}></div><span>{option}</span>
                                </li>
                            )
                        })
                    }
                    </ul> 
                    :
                    <Input id='folderCreateInput'/>
                }
                <Button disabled={btnDisabled} className={btnDisabled ? style.confirmDisabled : style.confirm} onClick={(e) => {this.onClickConfirm()}}>确认创建</Button>
            </div>
        )
    }
}

export default FolderCreateComponent;