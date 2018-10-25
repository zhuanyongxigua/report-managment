<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="用户名"
                   style="width: 200px" @on-blur="fnGetUserList"/>
        </div>

        <div class="center_box">
            <Table border :columns="columns1" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                title="详情信息"
                v-model="bUserDetails"
                @on-ok="fnModifyUserInfo"
                class-name="vertical-center-modal" width="590">
            <div class="info_boxs">
                <div class="room_info_box">
                    <div class="room_info_title">用户信息</div>
                    <div class="info_box2">
                        <div class="info_item">
                            <span class="info_label">昵称:</span>
                            <span v-text="oUserInfo.username"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">性别:</span>
                            <span v-text="oUserInfo.sex === '1' ? '男' : '女'"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">注册时间:</span>
                            <span v-text="oUserInfo.regDate"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">个人爱好:</span>
                            <span v-text="oUserInfo.hobby"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">简介:</span>
                            <span v-text="oUserInfo.introduction"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">积分:</span>
                            <span v-text="oUserInfo.credit"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">是否启用:</span>
                            <span>
                                <RadioGroup v-model="oUserInfo.status">
                                    <Radio label="1" :disabled="oUserInfo.closure ? false : true">是</Radio>
                                    <Radio label="0" :disabled="oUserInfo.closure ? false : true">否</Radio>
                                </RadioGroup>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>

        <Modal v-model="bDelModal" width="360" class-name="vertical-center-modal" :loading="bDelModalLoading">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>永久封停确认</span>
            </p>
            <div style="text-align:center">
                <p>永久封停之后将删除此用户大部分信息且无法恢复</p>
                <p>是否继续？</p>
            </div>
            <div slot="footer">
                <Button type="error" class="ripple_box"  size="large" long @click="fnBlockUser">确认</Button>
            </div>
        </Modal>

    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'consumersMgt',
        data () {
            return {
                aUserType: [],
                startDate: null,
                endDate: null,
                iIdentityType: null,
                sSortStr: '',
                //搜索框
                sQueryStr: '',
                //详情弹出框
                bUserDetails: false,
                iUserIndex: 0,
                oUserInfo: {},
                sCurBlockUserId: '',
                //分页
                iCurrentPage: 1,
                iTotalPages: 0,

                //表格
                columns1: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '页面加载时间',
                        key: 'loadPage',
                        align: 'center'
                    },
                    // {
                    //     title: '性别',
                    //     key: 'sex',
                    //     align: 'center',
                    //     render (h, p) {
                    //         return h('span', p.row.sex === 'm' ? '男' : '女');
                    //     }
                    // },
                    {
                        title: '解析DOM时间',
                        key: 'domReady',
                        align: 'center'
                    },
                    {
                        title: '获取资源时间',
                        key: 'networkTime',
                        align: 'center',
                    },
                    {
                        title: '资源加载完成时间',
                        key: 'contentLoad',
                        align: 'center',
                    },
                    {
                        title: 'onload回调时间',
                        key: 'onloadcb',
                        align: 'center',
                    },
                    {
                        title: '详情',
                        key: 'action',
                        width: 90,
                        align: 'center',
                        render: (h, p) => {
                            return h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small',
                                    attrs: {
                                        class: 'in_table_btn'
                                    }
                                },
                                on: {click: () => this.fnShowUserDetailsModal(p)}
                            }, '详情')
                        }
                    }
                ],
                aTableData: [],
                bDelModalLoading: true,
                bDelModal: false
            }
        },

        created: function () {
            this.fnGetUserList();
        },
        methods: {
            //获取用户列表
            fnGetUserList() {
                return axios.post('api/getPerformance', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        performanceVo: {projectId: this.$route.query.projectId || ''}
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.iTotalPages = res.data.total;
                    })
                    .catch(console.log);
            },
            fnModifyUserInfo() {
                axios.put('user/modifyUserStatus', {
                    id: this.oUserInfo.id,
                    status: this.oUserInfo.status
                })
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bUserDetails = false, 1000))
                    .then(this.fnGetUserList)
                    .catch(util.fnHandleError.bind(this));
            },
            fnBlockUser() {
                axios.put('user/closureUser', {id: this.sCurBlockUserId})
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelModal = false, 1000))
                    .then(this.fnGetUserList)
                    .catch(err => util.fnHandleError.call(this)('bDelModalLoading'));
            },
            fnShowUserDetailsModal(params) {
                this.bUserDetails = true;
                this.oUserInfo = JSON.parse(JSON.stringify(this.aTableData[params.index]));
                this.oUserInfo.status = this.oUserInfo.status ? '1' : '0';
            },
            //永久封停对话框
            fnShowBlockModal(params) {
                this.bDelModal = true;
                this.sCurBlockUserId = JSON.parse(JSON.stringify(params.row.id));
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetUserList();
            },
            fnGetListByTime(time){
                this.startDate = time[0];
                this.endDate = time[1];
                this.fnGetUserList();
            }
        }
    }
</script>
