import env from '../config/env';

let util = {};

if (env === 'development') {
    util.baseURL = 'http://192.168.1.102:3000/';
    // util.baseURL = 'http://www.11wdkj.com/pavilion';
    // util.baseURL = 'http://d8dcc1b4.ngrok.io/pavilion';
} else {
    util.baseURL = 'http://www.11wdkj.com/pavilion';
    // util.baseURL = 'http://211.141.29.194/pavilion/system';
}

util.title = function(title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};

/*iview表单验证，柯里化（闭包），先使iview的modal的loading效果加载（用于自定义modal footer的情况），返回一个会返回Promise对象的函数
* 调用方法：1.如果iview的modal的footer是自定义，
*         则util.fnValidateInfo.call(this, 'modal_loading').call(this, name)，
*         最后的一个参数那么是使用iview表单时自定义的formValidate对象的key，是一个字符串，如’formValidate‘；
*         2.如果iview的modal的footer未自定义，
*         则util.fnValidateInfo().call(this, name)
* */
util.fnValidateInfo = function(_modal_loading) {
    if (_modal_loading) {
        this[_modal_loading] = true;
    }
    return function(name) {
        return new Promise((resolve, reject) => {
            this.$refs[name].validate(valid => valid ? resolve(true) : reject(false));
        });
    }
}

util.fnHandleSuccess = function(res) {
    if (res.data.success) {
        this.$Message.success('操作成功');
        return iCurPageNum => this[iCurPageNum] = 1;
    }
    return () => Promise.reject(res.data.message);
}

util.fnHandleError = function(err) {
    err ? this.$Message.error(err) : this.$Message.error('操作失败');
    return param => {
        this[param] = !this[param];
        setTimeout(() => this[param] = !this[param], 0);
        return _modal_loading => this[_modal_loading] = false;
    }
}

util.fnCloseAndLoading = function(_bModal) {
    setTimeout(() => this[_bModal] = false, 1000);
    return _modal_loading => setTimeout(() => this[_modal_loading] = false, 1000);
}

//涟漪
util.addRippleEffect = function(e) {
    var target = e.target;
    if(target.className.indexOf("ripple_box") !== -1) {} else return false;
    var rect = target.getBoundingClientRect();
    var ripple = target.querySelector('.ripple');
    if(!ripple) {
        ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px';
        target.appendChild(ripple);
    }
    ripple.classList.remove('show');
    var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
    var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
    ripple.style.top = top + 'px';
    ripple.style.left = left + 'px';
    ripple.classList.add('show');
    return false;
}

export default util;
