import env from '../config/env';
let util = {

};

if (env === 'development') {
    util.baseURL = 'http://192.168.1.102:3000/';
} else {
    util.baseURL = '../';
}

util.title = function(title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};

util.fnValidateInfo = function(name) {
    return new Promise((resolve, reject) => {
        this.$refs[name].validate(valid => valid ? resolve(true) : reject(false));
    })
}
util.fnHandleSuccess = function(res) {
    if (res.data.success) {
        this.$Message.success('操作成功');
        return;
    }
    return Promise.reject(res.data.message);
}
util.fnHandleError = function(err) {
    err ? this.$Message.error(err) : this.$Message.error('操作失败');
    return param => {
        this[param] = false;
        setTimeout(() => {
            this[param] = true;
        }, 0);
    }
}

export default util;