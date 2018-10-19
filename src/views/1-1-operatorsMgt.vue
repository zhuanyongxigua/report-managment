<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="管理员名称"
                   style="width: 200px" @on-blur="fnGetOprList"/>
            <Button style="margin-right: 10px;float: right" type="primary" @click="fnShowAddOprModal('oAddOperatorInfo')">新增</Button>
        </div>

        <div class="center_box">
            <Table border :columns="aTableColumns" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                v-model="bAddOperator"
                title="新增管理员"
                :loading="bAddModalLoading"
                @on-ok="fnAddOpr('oAddOperatorInfo')">
            <Form style="margin-left: -10px; margin-right: 10px; margin-top: 10px;"
                  ref="oAddOperatorInfo"
                  :model="oAddOperatorInfo"
                  :rules="oAddOperatorInfoRules"
                  :label-width="100">
                <Form-item label="账号" prop="loginId">
                    <Input v-model="oAddOperatorInfo.loginId" placeholder="请输入账号"></Input>
                </Form-item>
                <Form-item label="管理员姓名" prop="username">
                    <Input v-model="oAddOperatorInfo.username" placeholder="请输入管理员姓名"></Input>
                </Form-item>
                <Form-item label="角色" prop="groupId">
                    <Select v-model="oAddOperatorInfo.groupId" placeholder="请选择管理员角色">
                        <Option v-for="item in aRoles" :value="item.id.toString()" v-text="item.name"></Option>
                    </Select>
                </Form-item>
            </Form>
        </Modal>

        <Modal
                title="详情信息"
                v-model="bOprDetails"
                :loading="bModifyModalLoading"
                @on-ok="fnModifyOprInfo('oOprInfo')"
                class-name="vertical-center-modal" width="590">
            <div class="info_boxs">
                <div class="room_info_box">
                    <Form style="margin-left: -10px; margin-right: 10px; margin-top: 10px;"
                          ref="oOprInfo"
                          :model="oOprInfo"
                          :rules="oModifyOperatorInfoRules"
                          :label-width="100">
                        <Form-item label="账号" prop="loginId">
                            <Input v-model="oOprInfo.loginId" placeholder="请输入账号"></Input>
                        </Form-item>
                        <Form-item label="管理员姓名" prop="username">
                            <Input v-model="oOprInfo.username" placeholder="请输入管理员姓名"></Input>
                        </Form-item>
                        <Form-item label="角色" prop="groupId">
                            <Select v-model="oOprInfo.groupId" placeholder="请选择管理员角色">
                                <Option v-for="item in aRoles" :value="item.id.toString()" v-text="item.name"></Option>
                            </Select>
                        </Form-item>
                        <Form-item label="是否启用" prop="status">
                            <Select v-model="oOprInfo.status" placeholder="请选择是否启用">
                                <Option value="1">是</Option>
                                <Option value="0">否</Option>
                            </Select>
                        </Form-item>
                        <Form-item label="密码" prop="password">
                            <Input v-model="oOprInfo.password" placeholder="请输入密码"></Input>
                        </Form-item>
                    </Form>
                </div>
            </div>
        </Modal>

    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'operatorsMgt',
        data () {
            const validateUsername = (rule, value, callback) => {
                let regExp = /^[A-Za-z][A-Za-z0-9]{3,14}$/;
                if (!value) {
                    return callback(new Error('账号不能为空'));
                }
                if (!regExp.test(value)) {
                    return callback(new Error('用户名由4到15个英文字母和数字组成，且以字母开头'))
                }
                callback();
            };
            return {
                aRoles: [],
                //搜索框
                sQueryStr: '',

                //分页
                iCurrentPage: 1,
                iTotalPages: 0,

                //表格
                aTableColumns: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '登录账号',
                        key: 'loginId',
                        align: 'center'
                    },
                    {
                        title: '昵称',
                        key: 'username',
                        align: 'center'
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
                                on: {click: () => this.fnShowOprDetailsModal(p)}
                            }, '详情')
                        }
                    }
                ],
                aTableData: [],

                //新增弹出框
                bAddOperator: false,
                bAddModalLoading: true,
                oAddOperatorInfo: {
                    loginId: '',
                    username: '',
                    groupId: ''
                },
                oAddOperatorInfoRules: {
                    loginId: [
                        {validator: validateUsername, required: true, trigger: 'blur'},
                    ],
                    username: [
                        {required: true, message: '管理员名称不能为空', trigger: 'blur'}
                    ],
                    groupId: [
                        {required: true, message: '管理员角色不能为空', trigger: 'change'}
                    ]
                },

                //详情弹出框
                bOprDetails: false,
                iOprIndex: 0,
                oOprInfo: {},
                bModifyModalLoading: true,
                oModifyOperatorInfoRules: {
                    loginId: [
                        {validator: validateUsername, required: true, trigger: 'blur'}
                    ],
                    realname: [
                        {required: true, message: '管理员名称不能为空', trigger: 'blur'}
                    ],
                    status: [
                        {required: true, message: '启用状态不能为空', trigger: 'change'}
                    ],
                    username: [
                        {required: true, message: '昵称不能为空', trigger: 'blur'}
                    ],
                    groupId: [
                        {required: true, message: '管理员角色不能为空', trigger: 'change'}
                    ]
                },
            }
        },

        created: function () {
            this.fnGetOprList();
            this.fnGetRoleList();
        },
        methods: {
            //获取操作员列表
            fnGetOprList() {
                return axios.post('operator/searchManagersByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        managerVo: {queryStr: this.sQueryStr || ''}
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.iTotalPages = res.data.total;
                    })
                    .catch(console.log);
            },
            fnGetRoleList() {
                return axios.post('operator/searchAuthGroups', {})
                    .then(res => this.aRoles = [...res.data])
                    .catch(console.log);
            },
            fnModifyOprInfo(name) {
                util.fnValidateInfo.call(this, name)
                    .then(res => axios.put('operator/modifyManager', this.oOprInfo))
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bOprDetails = false, 1000))
                    .then(this.fnGetOprList)
                    .catch(err => util.fnHandleError.call(this, err)('bModifyModalLoading'));
            },
            fnAddOpr(name) {
                util.fnValidateInfo.call(this, name)
                    .then(res => axios.put('operator/addManager', this.oAddOperatorInfo))
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bAddOperator = false, 1000))
                    .then(this.fnGetOprList)
                    .catch(err => util.fnHandleError.call(this, err)('bAddModalLoading'));
            },
            fnShowAddOprModal(name) {
                this.bAddOperator = true;
                this.$refs[name].resetFields();
            },
            fnShowOprDetailsModal(params) {
                this.bOprDetails = true;
                this.$refs['oOprInfo'].resetFields();
                this.oOprInfo = JSON.parse(JSON.stringify(this.aTableData[params.index]));
                this.oOprInfo.status = this.oOprInfo.status ? '1' : '0';
                this.oOprInfo.groupId = this.oOprInfo.groupId.toString();
                this.oOprInfo.password = '';
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetOprList();
            },
        }
    }
</script>
