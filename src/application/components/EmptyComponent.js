import React, { Component } from 'react';
import style from '../common/css/empty.less';
import image from '../common/img/empty.png';

class EmptyComponent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={style.container}>
                <img src={image}></img>
                <span>{this.props.emptyText}</span>
            </div>
        )
    }
}

export default EmptyComponent;