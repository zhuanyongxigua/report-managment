<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="搜索"
                   style="width: 200px" @on-blur="fnGetOprList"/>
        </div>

        <div class="center_box">
            <Table border :columns="aTableColumns" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

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
                          :label-width="100">
                        <Form-item label="账号" prop="loginId">
                            <Input v-model="oOprInfo.loginId" placeholder="请输入账号"></Input>
                        </Form-item>
                        <Form-item label="管理员姓名" prop="username">
                            <Input v-model="oOprInfo.username" placeholder="请输入管理员姓名"></Input>
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
            return {
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
                        title: '时间',
                        key: 'createdAt',
                        align: 'center'
                    },
                    {
                        title: '日志类型',
                        key: 'msg',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.msg[1]);
                        }
                    },
                    {
                        title: '页面地址',
                        key: 'from',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.from[1]);
                        }
                    },
                    // {
                    //     title: '浏览器',
                    //     key: 'status',
                    //     align: 'center',
                    // },
                    {
                        title: '错误堆栈',
                        key: 'msg',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.msg[0]);
                        }
                    },
                    // {
                    //     title: '详情',
                    //     key: 'action',
                    //     width: 90,
                    //     align: 'center',
                    //     render: (h, p) => {
                    //         return h('Button', {
                    //             props: {
                    //                 type: 'primary',
                    //                 size: 'small',
                    //                 attrs: {
                    //                     class: 'in_table_btn'
                    //                 }
                    //             },
                    //             on: {click: () => this.fnShowOprDetailsModal(p)}
                    //         }, '详情')
                    //     }
                    // }
                ],
                aTableData: [],
                //详情弹出框
                bOprDetails: false,
                iOprIndex: 0,
                oOprInfo: {},
                bModifyModalLoading: true,
            }
        },

        created: function () {
            this.fnGetOprList();
        },
        methods: {
            //获取操作员列表
            fnGetOprList() {
                return axios.post('api/getReport', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        errorVo: {projectId: this.$route.query.projectId || ''}
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.aTableData.forEach(ele => {
                            let oDate = new Date(ele.createdAt);
                            ele.createdAt = oDate.getFullYear() + "-" + (oDate.getMonth() + 1) + "-" + oDate.getDate() + " " + oDate.getHours() + ":" + oDate.getMinutes() + ":" + oDate.getSeconds();
                            return ele;
                        })
                        this.iTotalPages = res.data.total;
                    })
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
