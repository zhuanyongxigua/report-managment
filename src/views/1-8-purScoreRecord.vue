<style scoped>

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="用户账号"
                   style="width: 200px" @on-blur="fnGetPurScoreList"/>
            <Date-picker class="table_top_item" type="daterange" :options="options2" placement="bottom-end"
                                placeholder="选择购买日期" style="width: 200px" @on-change="fnGetListByTime"></Date-picker>
        </div>

        <div class="center_box">
            <Table border :columns="columns1" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    export default {
        name: 'purScoreRecord',
        data () {
            return {
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
                columns1: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '账号',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '金额',
                        key: 'money',
                        align: 'center'
                    },
                    {
                        title: '积分数',
                        key: 'credit',
                        align: 'center'
                    },
                    {
                        title: '购买时间',
                        key: 'createDate',
                        align: 'center'
                    }
                ],
                aTableData: [],
            }
        },

        created: function () {
            this.fnGetPurScoreList();
        },
        methods: {
            //获取用户列表
            fnGetPurScoreList() {
                return axios.post('creditLog/searchCreditLogsByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        creditLogVo: {
                            queryStr: this.sQueryStr || '',
                            queryDateQ: this.startDate || null,
                            queryDateZ: this.endDate || null,
                            type: 1
                        }
                    }
                })
                    .then(res => {
                        this.aTableData = [...res.data.rows];
                        this.iTotalPages = res.data.total;
                    })
                    .catch(console.log);
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetPurScoreList();
            },
            fnGetListByTime(time){
                this.startDate = time[0];
                this.endDate = time[1];
                this.fnGetPurScoreList();
            },
        }
    }
</script>
