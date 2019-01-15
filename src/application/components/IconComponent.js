import React, { Component } from 'react';

class IconComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            iconClass: props.iconClass
        }
    }

    render() {
        return (
            <svg className={`icon`} aria-hidden="true">
                <use xlinkHref={`#icon-${this.state.iconClass}`}></use>
            </svg>
        )
    }
}

export default IconComponent;