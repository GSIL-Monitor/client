import React, { Component } from 'react';
import { Layout, Menu, Button, Icon, Avatar } from "antd";
import {
    HashRouter as Router,
    Route,
    Link,
    Switch,
    NavLink ,
    Redirect
} from "react-router-dom";
import createBrowserHistory from 'history/createBrowserHistory';
import style from "./common/css/App.less";
import './common/fonts/iconfont.js';
import './common/fonts/iconfont.css';

import HomeContainer from './containers/HomeContainer';
import ProjectDetailContainer from './containers/ProjectDetailContainer';
import ProjectCreateContainer from './containers/ProjectCreateContainer';
import ProjectEditContainer from './containers/ProjectEditContainer';
import ComfirmDom from './containers/confirm';
import LoadingControl from './containers/LoadingControl';
import eventProxy from 'react-eventproxy';
const { Header, Content, Sider } = Layout;



class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: 'UserName'
        }
    }

    componentDidMount() {
        eventProxy.on('back', (param) => {
            console.log(param);
            this.setState({
                username: param.key
            })
        })
        document.addEventListener('dragover', event => event.preventDefault());
        document.addEventListener('drop', event => event.preventDefault());
    }

    render() {
        return (
            <Router>        
                <Layout className={style.container}>
                    <Header>
                        <div className={style.logo} />
                        <div className={style.userIcon}>
                            <Avatar size={44} icon="user" />
                            <span>{this.state.username}</span>
                        </div>
                        <div className={style.logout}>
                            <Icon type="poweroff" theme="outlined" />
                            退出系统
                        </div>
                    </Header>
                    <Switch>
                        <Route path="/home" component={HomeContainer} />
                        <Route path="/detail/:data" component={ProjectDetailContainer} />
                        <Route path="/create" component={ProjectCreateContainer} />
                        <Route path="/edit/:data" component={ProjectEditContainer} />
                        <Redirect path="/" to={{pathname: '/home'}}/>
                    </Switch>
                    <LoadingControl></LoadingControl>
                    <ComfirmDom></ComfirmDom>
                </Layout>           
            </Router>
            
        );
    }
}

export default App;