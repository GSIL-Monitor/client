import React, { Component } from 'react'
import style from '../common/css/projectlist.less'
import Poster from '../common/img/poster.jpg'
import Dateformatter from '../common/js/dateformatter';
import { Menu, Dropdown, Icon } from 'antd';
import backgroundResolver from '../communication/backgroundResolver';
import {confirm} from '../containers/confirm';
import eventproxy from 'react-eventproxy';
import toast from '../common/js/toast';

class ProjectComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cover: props.projectInfo.cover,
            name: props.projectInfo.projectName,
            time: props.projectInfo.time,
            type: props.projectInfo.projectTypeAliases,
        }
        this.onClickGotoProjectDetail = this.onClickGotoProjectDetail.bind(this);
        this.onClickOptionMenu = this.onClickOptionMenu.bind(this);
    }

    onClickGotoProjectDetail() {
        this.props.history.push(`/detail/${JSON.stringify(this.props.projectInfo)}`);
    }

    onClickOptionMenu(e) {
        e.domEvent.preventDefault();
        e.domEvent.stopPropagation();
        console.log(e);
        if (e.key == '0') {
            this.props.history.push(`/edit/${JSON.stringify(this.props.projectInfo)}`);
        }
        if (e.key == '1') {
            confirm({
                title: '删除项目',
                okTest: '确认',
                cancelText: '取消',
                msg: `确认删除"${this.state.name}"项目`,
                onOk: () => {
                    backgroundResolver.request('/deleteProject', this.props.projectInfo.projectId).then(res => {
                        console.log('deleteProject success', res);
                        eventproxy.trigger('searchProjects');
                    }).catch(err => {
                        console.log('deleteProject error', err);
                    })
                }
            });
        }
        if (e.key == '2') {
            confirm({
                title: '同步项目',
                okTest: '确认',
                cancelText: '取消',
                msg: `确认同步"${this.state.name}"项目`,
                onOk: () => {
                    backgroundResolver.request('/syncProject', this.props.projectInfo.projectId).then(res => {
                        console.log('syncProject success', res);
                        toast.show('同步成功');
                    }).catch(err => {
                        console.log('syncProject error', err);
                        toast.show('同步失败');
                    })
                }
            });
        }
    }

    render() {
        const menu = (
            <Menu onClick={this.onClickOptionMenu}>
                <Menu.Item key="0"><Icon type="edit" />重新编辑</Menu.Item>
                <Menu.Item key="1"><Icon type="delete" />删除项目</Menu.Item>
                <Menu.Item key="2"><Icon type="sync" />同步项目</Menu.Item>
            </Menu>
        );
        return(
            <ul className={style.movieCard} id='projectList'>
                <li className={style.content} onClick={this.onClickGotoProjectDetail}>
                    <a>
                        <img src={this.state.cover} />
                        <p className={style.movieName}>{this.state.name}</p>
                        <p>{Dateformatter.timestampToString(this.state.time) + '上映'}</p>
                        <span className={style.tag}>{this.state.type}</span>
                        <Dropdown overlay={menu} trigger={['click']} placement='bottomCenter' className={style.moreOption} onClick={e => e.stopPropagation()} getPopupContainer={() => document.getElementById('projectList')}>
                            <div className={style.moreOption}>
                                <div className={style.dot}></div>
                                <div className={style.dot}></div>
                                <div className={style.dot}></div>
                            </div>
                        </Dropdown>
                    </a>
                </li>
            </ul>
        )
    }
}

export default ProjectComponent;
