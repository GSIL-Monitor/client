import React, { Component } from 'react'
import ProjectComponent from '../components/ProjectComponent';
import backgroundResolver from '../communication/backgroundResolver';
import eventproxy from 'react-eventproxy';
import style from "../common/css/App.less";
import EmptyComponent from '../components/EmptyComponent';

class ProjectListContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectInfoList: []
        }
    }

    componentDidMount() {
        this.queryProjectList();
        eventproxy.on('searchProjects', (keyword) => {
            this.queryProjectList(keyword);
        });
    }

    queryProjectList(keyword, categoryAttributeItemIds) {
        keyword = keyword || '';
        categoryAttributeItemIds = categoryAttributeItemIds || [];
        backgroundResolver.request('/searchProjects', {
            keyword: keyword,
            categoryAttributeItemIds: categoryAttributeItemIds
        }).then(({param}) => {
            this.setState({
                projectInfoList: param.sort((a, b) => {
                    return a.time > b.time ? -1 : 1
                }),
                keyword: keyword
            });
        }).catch(err => {
            console.log('searchProjects', err);
        })
    }

    render() {
        const isNotEmpty = this.state.projectInfoList.length > 0;
        const keyword = this.state.keyword;
        const emptyText = keyword ? `找不到与 "${keyword}" 相关的项目, 换个关键字试试哦~` : '还没有项目哦，快去创建新项目吧~';
        return(
            isNotEmpty ?
            <div className={style.projectList}>
                {this.state.projectInfoList.map(info => {
                    return (
                        <ProjectComponent history={this.props.history} projectInfo={info} key={info.projectId}></ProjectComponent>
                    )
                })}
            </div>
            :
            <EmptyComponent emptyText={emptyText}/>
        )
    }
}

export default ProjectListContainer;