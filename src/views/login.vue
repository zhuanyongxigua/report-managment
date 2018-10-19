<style lang="less">

</style>
<template>
    <div class="login_big_box">
        <div class="flex1"></div>
        <div class="login_content">
            <div class="mlogin_box">
                <h2 class="login_title">活力榜公众平台后台管理系统</h2>
                    <form class="form-signin">
                        <Input class="login_input" icon="android-phone-portrait" placeholder="账号" v-model="account" />
                        <Input class="login_input" icon="ios-unlocked" type="password" placeholder="密码" v-model="password" />
                        <Button class="btn_login" type="primary" @click="loginSubmit2()">登录</Button>
                    </form>
            </div>
        </div>
        <div class="flex1"></div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'login',
        data () {
            return {
                account:'',
                password:''
            }
        },
        created() {
            window.addEventListener('keyup', (e) => {
                if (e.keyCode === 13) {
                    this.loginSubmit();
                }
            });
        },
        methods: {
            loginSubmit(){
                let regExp = /^[A-Za-z][A-Za-z0-9]{3,14}$/;
                if (!this.account) {
                    this.$Message.error('账号不能为空');
                    return;
                }
                if (!regExp.test(this.account)) {
                    this.$Message.error('用户名由4到15个英文字母和数字组成，且以字母开头');
                    return;
                }
                if (!this.password) {
                    this.$Message.error('密码不能为空');
                    return;
                }
                axios.post('backstageManager/login', {
                    loginId: this.account,
                    password: this.password
                })
                    .then(this.fnHandleSuccess)
                    .then(res => setTimeout(() => this.$router.push("index"),100))
                    .catch(this.fnHandleError)
            },
            loginSubmit2() {
                this.$Message.success('登录成功');
                setTimeout(() => {
                    this.$router.push("index");
                },100)
            },
            fnHandleSuccess(res) {
                if (res.data.success) {
                    this.$Message.success('操作成功');
                    return;
                }
                return Promise.reject(res.data.message);
            },
            fnHandleError(err) {
                err ? this.$Message.error(err) : this.$Message.error('操作失败');
                return param => {
                    this[param] = false;
                    setTimeout(() => {
                        this[param] = true;
                    }, 0);
                }
            }
        }
    }

</script>
