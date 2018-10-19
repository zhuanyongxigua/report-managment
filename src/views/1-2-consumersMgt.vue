<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="用户名"
                   style="width: 200px" @on-blur="fnGetUserList"/>
            <Select style="width: 200px" v-model="iIdentityType" placeholder="请选择身份类型" @on-change="fnGetUserList">
                <Option v-for="item in aUserType" :value="item.id.toString()" v-text="item.name"></Option>
            </Select>
            <Select style="width: 200px" v-model="sSortStr" placeholder="请选择身份类型" @on-change="fnGetUserList">
                <Option value="reg_date desc">关注时间</Option>
                <Option value="receives desc">被打赏积分数</Option>
                <Option value="rewards desc">打赏积分数</Option>
            </Select>
            <Date-picker class="table_top_item" type="daterange" :options="options2" placement="bottom-end"
                                placeholder="选择注册日期" style="width: 200px" @on-change="fnGetListByTime"></Date-picker>
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

                //时间范围
                options2: {
                    shortcuts: [
                        {
                            text: '近7天',
                            value () {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                return [start, end];
                            }
                        },
                        {
                            text: '近2周',
                            value () {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                                return [start, end];
                            }
                        },
                        {
                            text: '近1月',
                            value () {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                return [start, end];
                            }
                        },
                        {
                            text: '近3月',
                            value () {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                return [start, end];
                            }
                        }
                    ]
                },

                //表格
                columns1: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '昵称',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '性别',
                        key: 'sex',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.sex === 'm' ? '男' : '女');
                        }
                    },
                    {
                        title: '关注时间',
                        key: 'regDate',
                        align: 'center'
                    },
                    {
                        title: '身份类型',
                        key: 'type',
                        align: 'center',
                    },
                    {
                        title: '被打赏积分数',
                        key: 'receives',
                        align: 'center',
                    },
                    {
                        title: '打赏积分数',
                        key: 'rewards',
                        align: 'center',
                    },
                    {
                        title: '启用停用',
                        key: 'status',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.status ? '启用' : '停用');
                        }
                    },
                    {
                        title: '永久封停',
                        key: '',
                        align: 'center',
                        render: (h, p) => {
                            return h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small',
                                    disabled: p.row.closure ? false : true,
                                    attrs: {
                                        class: 'in_table_btn'
                                    }
                                },
                                on: {click: () => this.fnShowBlockModal(p)}
                            }, '永久封停')
                        }
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
            this.fnGetType();
            this.fnGetUserList();
        },
        methods: {
            fnGetType() {
                return axios.post('dictionary/searchThreshold', {
                    type: 'UserType'
                })
                    .then(res => {
                        this.aUserType = [...res.data];
                        this.aUserType.push({id: '', name: '全部'});
                    })
                    .catch(console.log);
            },
            //获取用户列表
            fnGetUserList() {
                return axios.post('user/searchUsersByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        userVo: {
                            queryStr: this.sQueryStr || '',
                            queryDateQ: this.startDate || null,
                            queryDateZ: this.endDate || null,
                            typeCode: this.iIdentityType === '' || this.iIdentityType === null ? null : Number(this.iIdentityType),
                            sortStr: this.sSortStr
                        }
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
