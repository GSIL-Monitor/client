import React, { Component } from 'react';
import { Layout, Menu, Button, Icon, Avatar } from "antd";
import style from "../common/css/App.less";
import ProjectListContainer from './ProjectListContainer';
import eventproxy from 'react-eventproxy';

const { Header, Content, Sider } = Layout;
console.log(style.projectListContainer, 'xix');

class HomeContainer extends Component {
    constructor(props) {
        super(props);
        this.onClickCreateProject = this.onClickCreateProject.bind(this);
        this.onSearchKeyword = this.onSearchKeyword.bind(this);
    }

    componentDidMount() {
        document.querySelector(`.${style.searchBar} input`).addEventListener('keypress', (e) => {
            this.onSearchKeyword(e);
        })
    }

    onClickCreateProject() {
        this.props.history.push('/create')
    }

    onSearchKeyword(e) {
        if (e.key == "Enter") {
            const keyword = e.target.value;
            eventproxy.trigger('searchProjects', keyword);
        }
    }

    render() {
        return(
            <Content>
                <div className={style.operationArea}>
                    <Button className={style.createBtn} onClick={this.onClickCreateProject}>
                        + 创建新项目
                    </Button>
                    <div className={style.searchBar}>
                        <input type="text" />
                        <Icon type="search" theme="outlined" />
                    </div>
                </div>
                <ProjectListContainer history={this.props.history}></ProjectListContainer>
            </Content>
        )
    }
}

export default HomeContainer;
