import React, { Component } from 'react';
import style from "../common/css/loading.less";
import eventproxy from 'react-eventproxy';

class LoadingControl extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            title: '正在加载...',
            show: false  
        }
    }

    componentDidMount() {
        eventproxy.on('startLoading', (msg) => {
            console.log('Loading start', this.state);
            this.setState({
                title: msg,
                show: true
            })
        })

        eventproxy.on('stopLoading', () => {
            console.log('Loading stop', this.state);
            this.setState({
                show: false
            })
        })

        console.log('Loading mount');
    }

    render() {
        console.log('Loading Render', this.state);
        return(
            <div className={this.state.show ? style.loadingContainer : ''}>
                {this.state.show ?
                    <div className={style.loadingContent}>
                        <svg className={`icon ${style.loadingIcon}`} aria-hidden="true">
                            <use xlinkHref={`#icon-jiazai`}></use>
                        </svg>
                        <div className={style.loadingTitle}>{this.state.title}</div>
                    </div>
                    :
                    ''   
                }    
            </div> 
        )
    }
}

export default LoadingControl;

export const loading = {
    startLoading: (msg) => {
        eventproxy.trigger('startLoading', msg);
    },
    stopLoading: () => {
        console.log('stopLoading 222222 ');
        eventproxy.trigger('stopLoading');
    }
}