import style from '../css/toast.less';
const $ = require('jquery');

class ToastControl {

    static show(title, callback, time = 2000) {
        let $body = $('body');
        let $toast = $(`<div class="toast">
                            <div class="toast-title">${title}</div>
                        </div>`)
        $body.append($toast);
        setTimeout(() => {
            $toast.fadeOut(250, () => {
                $toast.remove();
            });
            callback && callback();
        }, time);  
    }
}

export default ToastControl;