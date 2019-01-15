import React, {Component} from 'react';
import eventProxy from 'react-eventproxy';

import '../common/css/confirm.less'

export const confirm = (msg) => {
    eventProxy.trigger('confirm', msg);
}

class ConfirmDom extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stack: []
        }
        this.bind(['handelOk', 'handelCancel'])
    }

    bind(methodArray) {
        methodArray.forEach(method => this[method] = this[method].bind(this));
    }

    handelOk() {
        const stack = [...this.state.stack]

        const confirm = stack.pop()
        confirm.onOk()

        this.setState({stack})
    }

    handelCancel() {
        const stack = [...this.state.stack]

        const confirm = stack.pop()
        typeof confirm.onCancel === 'function' && confirm.onCancel()
     
        this.setState({stack})
    }

    componentDidMount() {
        eventProxy.on('confirm', (msg) => {
            const {stack} = this.state

            if (msg) {
                this.setState({
                    stack: [
                        ...stack,
                        msg
                    ]
                })
            }
        });
    }

    render() {
        const {stack} = this.state
        const msg = stack[0] || {}
        return (
            <div>
                {stack.length
                    ? <div className="confirm-modal">
                            <div className={`confirm-dialog`} role="document">
                                <div className="confirm-content">
                                    <div className="confirm-header">
                                        <div className="confirm-title">{msg.title || '操作确认'}</div>
                                        <span onClick={this.handelCancel} className="confirm-close">
                                            <span aria-hidden="true">&times;</span>
                                        </span>
                                    </div>
                                    <div className="msg-content">{msg.msg}</div>
                                    <div className="confirm-footer">
                                        <button onClick={this.handelOk} className="confirm-btn">{msg.okText || '确定'}</button>
                                        <button onClick={this.handelCancel} className="cancel-btn">{msg.cancelText || '取消'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    : ''}
            </div>
        )
    }
}

export default ConfirmDom
