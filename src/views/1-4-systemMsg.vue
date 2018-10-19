<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="发布人"
                   style="width: 200px" @on-blur="fnGetSysMsgList"/>
            <Date-picker class="table_top_item" type="daterange" :options="options2" placement="bottom-end"
                         placeholder="选择发布日期" style="width: 200px" @on-change="fnGetListByTime"></Date-picker>
            <Button style="margin-right: 10px;float: right" type="primary" @click="fnShowCreateSysMsg('oSysMsgInfo')">创建系统消息</Button>
        </div>

        <div class="center_box">
            <Table border :columns="aSysMsgList" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                title="详情信息"
                v-model="bSysMsgDetails"
                @on-ok="fnCreateSysMsg"
                :loading="bAddModalLoading"
                class-name="vertical-center-modal" width="1000">
            <Form style="margin-left: -10px; margin-right: 10px; margin-top: 10px;"
                  ref="oSysMsgInfo"
                  :model="oSysMsgInfo"
                  :rules="oSysMsgInfoRules"
                  :label-width="100">
                <Form-item label="标题" prop="title">
                    <Input v-model="oSysMsgInfo.title" placeholder="标题"></Input>
                </Form-item>
                <Form-item label="问题描述" >
                    <script type="text/plain" id="editor" style="width:865px;"></script>
                </Form-item>
            </Form>
        </Modal>

        <Modal
                v-model="bDelSysMsg"
                title="确认删除"
                :loading="bDelSysMsgLoading"
                @on-ok="fnDelSysMsg">
            <p>您确认要删除此消息？</p>
        </Modal>
        <Modal
                v-model="bPubSelect"
                title="是否发布模板消息"
                :loading="bPubSelectLoading"
                @on-ok="fnPublishSysMsg">
            <p>是否发布模板消息？</p>
            <RadioGroup v-model="bIsTemplate">
                <Radio label="true">
                    <span>是</span>
                </Radio>
                <Radio label="false">
                    <span>否</span>
                </Radio>
            </RadioGroup>
        </Modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'systemMsg',
        data () {
            return {
                editor: null,
                startDate: null,
                endDate: null,
                //搜索框
                sQueryStr: '',

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
                aSysMsgList: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '标题',
                        key: 'title',
                        align: 'center'
                    },
                    {
                        title: '发布者',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '创建时间',
                        key: 'createDate',
                        align: 'center'
                    },
                    {
                        title: '发布日期',
                        key: 'publishDate',
                        align: 'center',
                    },
                    {
                        title: '状态',
                        key: 'status',
                        align: 'center',
                        render (h, p) {
                            return h('span', p.row.status === true ? '发布' : '未发布');
                        }
                    },
                    {
                        title: '发布',
                        key: 'views',
                        align: 'center',
                        render: (h, p) => {
                            return h('Button', {
                                props: {
                                    type: p.row.status ? 'warning' : 'success',
                                    size: 'small',
                                    attrs: {
                                        class: 'in_table_btn'
                                    }
                                },
                                on: {click: () => this.fnShowPubModal(p)}
                            }, p.row.status ? '取消发布' : '发布')
                        }
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
                                on: {click: () => this.fnShowSysMsgDetails(p)}
                            }, '详情')
                        }
                    }
                ],
                aTableData: [],

                //表单
                bSysMsgDetails: false,
                bAddModalLoading: true,
                oSysMsgInfo: {
                    title: '',
                },
                oSysMsgInfoRules: {
                    title: [
                        {required: true, message: '标题不能为空', trigger: 'blur'}
                    ]
                },

                //富文本
                oRichText: null,

                //删除
                bDelSysMsg: false,
                bDelSysMsgLoading: true,
                bPubSelect: false,
                bPubSelectLoading: true,
                oCurPubInfo: {},
                bIsTemplate: 'true',
                iDelCurId: null,

                //当前是修改还是新增
                sCurFunction: '',
                iCurId: null
            }
        },

        created: function () {
            this.fnGetSysMsgList();
        },
        methods: {
            //获取帖子列表
            fnGetSysMsgList() {
                return axios.post('topic/searchTopicsByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        topicVo: {
                            queryStr: this.sQueryStr || '',
                            queryDateQ: this.startDate || null,
                            queryDateZ: this.endDate || null,
                            type1: 2
                        }
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.iTotalPages = res.data.total;
                    })
                    .catch(console.log);
            },
            fnCreateSysMsg() {
                let url = '';
                let postData = {};
                if(this.editor.getContent() == '' || this.editor.getContent() == null){
                    this.$Message.error('请输入问题描述');
                    this.bAddModalLoading = false;
                    setTimeout(() => {
                        this.bAddModalLoading = true;
                    }, 0);
                    return;
                }
                if (this.sCurFunction === 'add') {
                    url = 'addSystemTopic';
                    postData.title = this.oSysMsgInfo.title;
                    postData.content = this.editor.getContent();
                } else {
                    url = 'modifySystemTopic';
                    postData.title = this.oSysMsgInfo.title;
                    postData.content = this.editor.getContent();
                    postData.id = this.iCurId;
                }

                axios.put('topic/' + url, postData)
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bSysMsgDetails = false, 1000))
                    .then(this.fnGetSysMsgList)
                    .catch(err => util.fnHandleError.call(this, err)('bAddModalLoading'));
            },
            fnPublishSysMsg() {
                axios.put('topic/publishSystemTopic', {
                    id: this.oCurPubInfo.row.id,
                    status: !this.oCurPubInfo.row.status,
                    isTemplate: this.bIsTemplate === 'true' ? true : false
                })
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bPubSelect = false, 1000))
                    .then(this.fnGetSysMsgList)
                    .catch(err => util.fnHandleError.call(this, err)('bPubSelectLoading'));
            },
            fnDelSysMsg() {
                axios.delete('topic/removeTopic', {
                    data: {id: this.iDelCurId}
                })
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelSysMsg = false, 1000))
                    .then(this.fnGetSysMsgList)
                    .catch(err => util.fnHandleError.call(this, err)('bDelSysMsgLoading'));
            },
            fnShowPubModal(param) {
                this.oCurPubInfo = param;
                if (param.row.status) {
                    this.fnPublishSysMsg();
                } else {
                    this.bPubSelect = true;
                }
            },
            fnShowCreateSysMsg(name) {
                this.sCurFunction = 'add';
                this.bSysMsgDetails = true;
                this.$refs[name].resetFields();
                this.editor.setContent('');
            },
            fnShowSysMsgDetails(params) {
                this.bSysMsgDetails = true;
                this.sCurFunction = 'modify';
                this.iCurId = params.row.id;
                this.oSysMsgInfo = JSON.parse(JSON.stringify(this.aTableData[params.index]));
                this.editor.setContent(this.oSysMsgInfo.content);
            },
            fnShowDelModal(params) {
                this.iDelCurId = params.row.id;
                this.bDelSysMsg = true;
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetSysMsgList();
            },
            fnDtlPagination(page) {
                this.iSysMsgDtlCurPage = page;
                this.fnGetDtlList();
            },
            fnGetListByTime(time){
                this.startDate = time[0];
                this.endDate = time[1];
                this.fnGetSysMsgList();
            }
        },
        mounted() {
            this.editor = UM.getEditor('editor');
        },
        destroyed() {
            this.editor.destroy();
            //UM.delEditor('editor');
        },
    }
</script>
