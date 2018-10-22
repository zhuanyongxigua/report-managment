<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="项目名称"
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
                <Form-item label="项目名" prop="projectName">
                    <Input v-model="oAddOperatorInfo.projectName" placeholder="请输入项目名"></Input>
                </Form-item>
            </Form>
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
                        title: '项目id',
                        key: 'projectId',
                        align: 'center'
                    },
                    {
                        title: '项目名',
                        key: 'projectName',
                        align: 'center'
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
                oOprInfo: {},
            }
        },

        created: function () {
            this.fnGetOprList();
        },
        methods: {
            //获取操作员列表
            fnGetOprList() {
                return axios.post('api/getProjectList', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        projectVo: {projectName: this.sQueryStr || ''}
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.iTotalPages = res.data.total;
                    })
                    .catch(console.log);
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
