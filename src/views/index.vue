<style scoped>
    .vertical-center-modal {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .vertical-center-modal .ivu-modal {
        top: 0;
    }

    .layout-logo {
        width: 350px;
        height: 50px;
        line-height: 50px;
        float: left;
        position: relative;
        top: 5px;
        left: 10px;
        background-size: contain;
        color: #fff;
        font-size: 20px;
        padding-left: 40px;
    }

    .header_right {
        -webkit-display: flex;
        display: -webkit-box; /* 老版本语法: Safari, iOS, Android browser, older WebKit browsers. */
        display: -moz-box; /* 老版本语法: Firefox (buggy) */
        display: -ms-flexbox; /* 混合版本语法: IE 10 */
        display: -webkit-flex; /* 新版本语法: Chrome 21+ */
        display: flex; /* 新版本语法: Opera 12.1, Firefox 22+ */
        -webkit-flex-direction: row;
        flex-direction: row;
        justify-content: flex-end;
    }

    .header_right_item {
        margin-right: 20px;
        font-size: 14px;
        height: 20px;
        line-height: 60px;
        cursor: pointer;
    }

    .header {
        justify-content: space-between;
    }

</style>

<template>
    <div class="layout HolyGrail">
        <header class="header">
            <div class="layout-logo">
                <span>活力榜公众平台后台管理系统</span>
            </div>
            <!-- 列表头的登录账号信息 -->
            <div class="header_right">
                <div class="header_right_item">
                    <Icon type="person" class="font_fff"></Icon>
                    <span class="layout-text" v-text="oUserInfo.loginId"></span>
                </div>

                <div class="header_right_item" @click="fnLogOut">
                    <Icon type="share" class="font_fff"></Icon>
                    <span class="layout-text">退出</span>
                </div>
            </div>
        </header>
        <div class="vCenter">
            <div class="menuBox">
                <!--前台左侧列表-->
                <Menu active-name="operatorsMgt" width="auto" class="left_menu" @on-select="fnCurView">
                        <Menu-item name="operatorsMgt" v-show="oPermission[1]">
                            <Icon type="clipboard"></Icon>
                            <span>JS错误</span>
                        </Menu-item>

                        <Menu-item name="consumersMgt" v-show="oPermission[2]">
                            <Icon type="calendar"></Icon>
                            <span>页面性能</span>
                        </Menu-item>
                </Menu>
            </div>
            <div class="contentBox">
                <component :is="sCurrentView"></component>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'index',
        data () {
            return {
                sCurrentView: 'operatorsMgt',
                oPermission: {
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false,
                    6: false,
                    7: false,
                    8: false,
                    9: false,
                },
                oUserInfo: {}
            }
        },
        components: {
            'operatorsMgt': require('./1-1-operatorsMgt'),
            'consumersMgt': require('./1-2-consumersMgt'),
            'forumPostsMgt': require('./1-3-forumPostsMgt'),
            'systemMsg': require('./1-4-systemMsg'),
            'withdrawMgt': require('./1-5-withdrawMgt'),
            'purScoreRuleSet': require('./1-6-purScoreRuleSet'),
            'ScoreSet': require('./1-7-ScoreSet'),
            'purScoreRecord': require('./1-8-purScoreRecord'),
            'rolePowerMgt': require('./1-9-rolePowerMgt')
        },
        created: function () {
            //    this.fnGetPersissions();
      for (var ele in this.oPermission) {
          this.oPermission[ele] = true;
      }
        },
        methods: {
            fnGetPersissions(){
                return axios.post('backstageManager/searchCurrentPersissions', {})
                    .then(res => {
                        res.data.success ? this.fnJudgeShow(res.data.result.Persissions) : this.$router.push('login');
                        this.oUserInfo = JSON.parse(JSON.stringify(res.data.result.managerVo));
                    })
                    .catch(console.log);
            },
            fnLogOut(){
                return axios.put('backstageManager/loginOut', {})
                        .then(res => {
                            res.data.success ? this.$router.push('login') : this.$Message.error('退出出错');
                        })
                        .catch(console.log);
            },
            fnJudgeShow(aPermission){
                aPermission.forEach(ele => this.oPermission[ele.code] = true)
            },
            fnCurView(status){
                this.sCurrentView = status;
            }
        }
    }
</script>
