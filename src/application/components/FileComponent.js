import React, { Component } from 'react';
import filetype from '../common/js/filetype';
import { Icon } from 'antd';
import style from '../common/css/filelist.less';
import eventproxy from 'react-eventproxy';
class FileComponent extends Component {
    
    constructor(props) {
        super(props);
        const {key, isDir} = this.props.fileInfo;
        this.state = {
            key: key,
            selected: false,
            paths: this.props.paths.concat(key),
            iconClass: filetype.getIconClass(key, isDir)
        }
        this.onClickFileItem = this.onClickFileItem.bind(this);
        this.onDoubleClickFileItem = this.onDoubleClickFileItem.bind(this);
        console.log('FileComponent', props.isSelected);
    }

    componentDidMount() {
        eventproxy.on('isSelectedAll', (selected) => {
            this.setState({
                selected: selected
            })
        })
    }

    componentWillUnmount() {
        // eventproxy.off('isSelectedAll');
    }

    onClickFileItem() {
        this.props.didSelecteAtIndex(this.props.index, !this.state.selected)
        this.setState({
            selected: !this.state.selected
        })
    }

    onDoubleClickFileItem() {
        console.log('onDoubleClickFileItem');
        if (this.props.fileInfo.isDir) {
            eventproxy.trigger('openFolder', this.state.paths);
        }
    }

    render() {
        const classname = `${style.fileItem} ${this.state.selected ? style.selected : ''}`;
        return (
            <li className={classname} onClick={this.onClickFileItem} onDoubleClick={this.onDoubleClickFileItem} title={this.state.key}>
                <Icon className={style.icon} type='check-circle'></Icon>
                <svg className={`icon ${style.iconfont}`} aria-hidden="true">
                    <use xlinkHref={`#icon-${this.state.iconClass}`}></use>
                </svg>
                <p className={style.fileName}>{this.state.key}</p>
            </li>
        )
    }
}

export default FileComponent;