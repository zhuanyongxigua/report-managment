<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="申请人"
                   style="width: 200px" @on-blur="fnGetWithdrawList"/>

            <Date-picker class="table_top_item" type="daterange" :options="options2" placement="bottom-end"
                         placeholder="申请时间" style="width: 200px" @on-change="fnGetListByTime"></Date-picker>
            <Select style="width: 200px" v-model="iApplyStatus" placeholder="提现状态" @on-change="fnGetWithdrawList">
                <Option value="1">待审批</Option>
                <Option value="3">已通过</Option>
                <Option value="4">全部</Option>
            </Select>
        </div>

        <div class="center_box">
            <Table border :columns="aTableColumns" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                v-model="bPassModal"
                title="确认通过"
                :loading="bPassLoading"
                @on-ok="fnPass">
            <p>确认通过此审核？</p>
        </Modal>

    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'withdrawMgt',
        data () {
            return {
                //搜索框
                sQueryStr: '',
                iApplyStatus: '4',
                startDate: null,
                endDate: null,

                //分页
                iCurrentPage: 1,
                iTotalPages: 0,

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
                aTableColumns: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '申请人',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '金额',
                        key: 'money',
                        align: 'center'
                    },
                    {
                        title: '提现状态',
                        key: 'status',
                        align: 'center',
                        render (h, p) {
                            let sIdentityType = '';
                            switch (p.row.status) {
                                case 1:
                                    return sIdentityType = '待审批';
                                case 3:
                                    return sIdentityType = '已通过';
                            }
                            return h('span', sIdentityType);
                        }
                    },
                    {
                        title: '通过',
                        key: 'action',
                        width: 90,
                        align: 'center',
                        render: (h, p) => {
                            console.log(p);
                            if (p.row.status === 1) {
                                return h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        attrs: {
                                            class: 'in_table_btn'
                                        }
                                    },
                                    on: {click: () => {
                                        this.bPassModal = true;
                                        this.oCurOptionInfo = p;
                                    }}
                                }, '通过')
                            } else {
                                return h('Button', {
                                    props: {
                                        disabled: true,
                                        size: 'small',
                                        attrs: {
                                            class: 'in_table_btn'
                                        }
                                    }
                                }, '已通过')
                            }

                        }
                    }
                ],
                aTableData: [],

                //通过审核确认modal
                bPassModal: false,
                bPassLoading: true,
                oCurOptionInfo: {}
            }
        },

        created: function () {
            this.fnGetWithdrawList();
        },
        methods: {
            //获取操作员列表
            fnGetWithdrawList() {
                return axios.post('applyCash/searchApplyCashsByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        applyCashVo: {
                            queryStr: this.sQueryStr || '',
                            status: this.iApplyStatus === '4' ? null : Number(this.iApplyStatus),
                            queryDateQ: this.startDate || null,
                            queryDateZ: this.endDate || null,
                        }
                    }
                })
                        .then(res => {
                            this.aTableData = [...res.data.rows];
                            this.iTotalPages = res.data.total;
                        })
                        .catch(console.log);
            },
            fnPass() {
                axios.put('applyCash/agreeApplyCash', {
                    id: this.oCurOptionInfo.row.id
                })
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bPassModal = false, 1000))
                    .then(this.fnGetWithdrawList)
                    .catch(res => util.fnHandleError.call(this, err)('bPassLoading'));
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetWithdrawList();
            },
            fnGetListByTime(time){
                this.startDate = time[0];
                this.endDate = time[1];
                this.fnGetWithdrawList();
            }
        }
    }
</script>
