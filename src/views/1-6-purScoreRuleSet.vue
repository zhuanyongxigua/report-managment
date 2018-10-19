<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Button style="margin-left: 10px;float: left" type="primary" @click="fnShowModal('oScoreInfo')">新建积分规则</Button>
        </div>

        <div class="center_box">
            <Table border :columns="aPurScoreList" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                title="详情信息"
                v-model="bModal"
                :loading="bModalLoading"
                @on-ok="fnCreateScoreRule('oScoreInfo')"
                class-name="vertical-center-modal" width="500">
            <Form style="margin-left: -10px; margin-right: 10px; margin-top: 10px;"
                  ref="oScoreInfo"
                  :model="oScoreInfo"
                  :rules="oScoreInfoRules"
                  :label-width="100">
                <Form-item label="金额" prop="money">
                    <Input type="text" v-model="oScoreInfo.money" placeholder="金额" nubmer></Input>
                </Form-item>
                <Form-item label="积分" prop="integral">
                    <Input type="text" v-model="oScoreInfo.integral" placeholder="积分" number></Input>
                </Form-item>
            </Form>
        </Modal>
        <Modal
                v-model="bDelScoreRule"
                title="确认删除"
                :loading="bDelRuleLoading"
                @on-ok="fnDelScoreRule">
            <p>您确认要删除此规则？</p>
        </Modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'purScoreRuleSet',
        data () {
            const validateNumber = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('不能为空'));
                }
                isNaN(value) ? callback(new Error('请输入数字')) : callback();
            }
            return {
                //分页
                iCurrentPage: 1,
                iTotalPages: 0,

                //表格
                aPurScoreList: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '金额',
                        key: 'money',
                        align: 'center'
                    },
                    {
                        title: '积分',
                        key: 'integral',
                        align: 'center'
                    },
                    {
                        title: '删除',
                        key: 'views',
                        align: 'center',
                        render: (h, p) => {
                            return h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small',
                                    attrs: {
                                        class: 'in_table_btn'
                                    }
                                },
                                on: {click: () => this.fnShowDelModal(p)}
                            }, '删除')
                        }
                    },
                    {
                        title: '修改',
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
                                on: {click: () => this.fnShowModal(p)}
                            }, '修改')
                        }
                    }
                ],
                aTableData: [],

                //规则弹出框
                bModal: false,
                oScoreInfoStore: {},
                bModalLoading: true,


                //表单
                oScoreInfo: {
                    money: '',
                    integral: ''
                },
                oScoreInfoRules: {
                    money: [
                        {validator: validateNumber, required: true, trigger: 'blur'}
                    ],
                    integral: [
                        {validator: validateNumber, required: true, trigger: 'blur'}
                    ]
                },
                sCurFunction: '',
                iCurId: null,

                //删除
                bDelScoreRule: false,
                bDelRuleLoading: true,
                iDelCurId: null
            }
        },

        created() {
            this.fnGetScoreList();
        },
        methods: {
            //获取帖子列表
            fnGetScoreList() {
                return axios.post('integralRule/searchIntegralRulesByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {integralRuleVo: {}}
                })
                        .then(res => {
                            this.aTableData = [...res.data.rows];
                            this.iTotalPages = res.data.total;
                        })
                        .catch(console.log);
            },
            fnCreateScoreRule(name) {
                let url = '';
                let postData = {};
                if (this.sCurFunction === 'modify') {
                    url =  'modifyIntegralRule';
                    postData.id = this.iCurId;
                    postData.money = parseFloat(this.oScoreInfo.money);
                    postData.integral = parseFloat(this.oScoreInfo.integral);
                } else {
                    url = 'addIntegralRule';
                    postData.money = parseFloat(this.oScoreInfo.money);
                    postData.integral = parseFloat(this.oScoreInfo.integral);
                }

                util.fnValidateInfo.call(this, name)
                    .then(res => axios.put('integralRule/' + url, postData))
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bModal = false, 1000))
                    .then(this.fnGetScoreList)
                    .catch(err => util.fnHandleError.call(this, err)('bModalLoading'));
            },
            fnDelScoreRule() {
                axios.delete('integralRule/removeIntegralRule', {
                        data: {id: this.iDelCurId}
                    })
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelScoreRule = false, 1000))
                    .then(this.fnGetScoreList)
                    .catch(err => util.fnHandleError.call(this, err)('bDelRuleLoading'));
            },
            fnShowModal(params) {
                this.bModal = true;
                if (typeof params.index === 'number') {
                    this.oScoreInfo = JSON.parse(JSON.stringify(this.aTableData[params.index]));
                    this.sCurFunction = 'modify';
                    this.iCurId = params.row.id;
                } else {
                    this.$refs[params].resetFields();
                    this.sCurFunction = 'add';

                }
            },
            fnShowDelModal(params) {
                this.iDelCurId = params.row.id;
                this.bDelScoreRule = true;
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetScoreList();
            }
        }
    }
</script>
