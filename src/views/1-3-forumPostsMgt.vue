<style scoped>
    .info_label {
        text-align: left;
        margin-left: 10px;
        width: 40px;
    }

    .info_media {
        border-bottom: 1px solid grey;
    }

    .info_box2 {
        height: 450px;
    }

    .info_box_media {
        margin-top: 10px;
    }

    .icon_font_size {
        font-size: 50px;
    }

    .media_div {
        margin-left: 10px;
        float: left;
    }
    .media_box {
        margin-top: 10px;
        height: 90px;
    }

    .clear_float:after{
        display:block;
        content: '';
        clear:both;
        height: 0px;
    }

</style>
<template>
    <div class="layout">
        <div class="table_top">
            <Input class="table_top_item" v-model="sQueryStr" icon="ios-search-strong" placeholder="发帖人昵称"
                   style="width: 200px" @on-blur="fnGetPostList"/>
            <Select style="width: 200px" v-model="iPostType" placeholder="请选择帖子类型" @on-change="fnGetPostList">
                <Option v-for="item in aTopicType" :value="item.id.toString()" v-text="item.name"></Option>
            </Select>
            <Date-picker class="table_top_item" type="daterange" :options="options2" placement="bottom-end"
                         placeholder="选择发帖日期" style="width: 200px" @on-change="fnGetListByTime"></Date-picker>
            <Select style="width: 200px; margin-left: 20px;" v-model="sortStr" placeholder="请选择排序方式" @on-change="fnGetPostList">
                <Option value="t.publish_date desc">注册日期</Option>
                <Option value="t.supports desc">点赞数</Option>
                <Option value="t.reviews desc">评论数</Option>
                <Option value="t.points desc">被打赏积分数</Option>
            </Select>
        </div>

        <div class="center_box">
            <Table border :columns="aPostList" :data="aTableData" size="small"></Table>
            <Page class="pages" :current="iCurrentPage" :page-size="10" :total="iTotalPages" @on-change="fnPagination"></Page>
        </div>

        <Modal
                title="详情信息"
                v-model="bPostDetails"
                class-name="vertical-center-modal"
                width="1000">
            <div class="info_boxs">
                <div class="room_info_box">
                    <div class="room_info_title">用户信息</div>
                    <div class="info_box2">
                        <div class="info_item">
                            <span class="info_label">标题:</span>
                            <span v-text="oPostInfo.title"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label">内容:</span>
                            <span v-text="oPostInfo.content"></span>
                        </div>
                        <div class="info_item">
                            <span class="info_label info_media">图片</span>
                        </div>
                        <div class="info_item media_box">
                            <div v-for="(item, index) in aFileImages" class="media_div" v-if="aFileImages.length != 0" @click="fnShowImgModal(index)">
                                <img style="width: 80px;height: 80px;" :src="item.path">
                            </div>
                        </div>
                        <div class="info_item info_box_media">
                            <span class="info_label info_media">视频</span>
                        </div>
                        <div class="info_item media_box clear_float">
                            <div v-for="(item, index) in aFileVideos" class="media_div icon_font_size" @click="fnShowVideoModal(index)" v-if="aFileVideos.length != 0">
                                <video width="100" height="100" style="border: 1px solid #ddd;">
                                    <source :src="item.path" type="video/ogg">
                                </video>
                            </div>
                        </div>
                        <div class="info_item info_box_media">
                            <span class="info_label info_media">音频</span>
                        </div>

                        <div class="info_item media_box">
                            <div class="media_div icon_font_size" v-if="oFileAudio.path">
                                <audio controls>
                                    <source :src="oFileAudio.path" type="audio/mp3">
                                    <source :src="oFileAudio.path" type="audio/ogg">
                                    <source :src="oFileAudio.path" type="audio/mpeg">
                                    <source :src="oFileAudio.path" type="audio/amr">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </div>
                    </div>
                    <div class="room_info_title">评论列表</div>
                    <div class="info_box2">
                        <Table border :columns="aCommentList" :data="aCmtTableData" size="small"></Table>
                        <Page class="pages" :current="iCurCmtPage" :page-size="8" :total="iDtlCmtTotal" @on-change="fnDtlCmtPagination"></Page>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button type="ghost" @click="bPostDetails = false">取消</Button>
            </div>
        </Modal>
        <Modal
                title="详情信息"
                v-model="bVideoModal"
                class-name="vertical-center-modal" width="700">
            <div style="margin:10px auto; text-align:center;" v-if="bVideoModal" >
                <video :src="oCurVideoInfo.path" width="100%" height="600" :id="oCurVideoInfo.id" controls style="margin:0 auto;"></video>
            </div>

            <div slot="footer">
                <Button type="ghost" @click="bVideoModal = false">取消</Button>
            </div>
        </Modal>
        <Modal
                title="图片详情"
                v-model="bImgModal"
                class-name="vertical-center-modal" width="900">
            <div style="margin:10px auto; text-align:center;" v-if="bImgModal" >
                <img style="width: 700px;height: 700px;" :src="oCurImgInfo.path">
            </div>

            <div slot="footer">
                <Button type="ghost" @click="bImgModal = false">取消</Button>
            </div>
        </Modal>
        <Modal
                v-model="bDelModal"
                title="确认删除"
                :loading="bDelModalLoading"
                @on-ok="fnDelChoose">
            <p v-if="bIsDelPost">您确认要删除此帖子？</p>
            <p v-else>您确认要删除此评论？</p>
        </Modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'forumPostsMgt',
        data () {
            return {
                aTopicType: [],
                startDate: null,
                endDate: null,
                iPostType: null,
                sortStr: '',
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
                aPostList: [
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
                        title: '被打赏积分',
                        key: 'points',
                        align: 'center'
                    },
                    {
                        title: '发帖时间',
                        key: 'publishDate',
                        align: 'center'
                    },
                    {
                        title: '帖子类型',
                        key: 'type',
                        align: 'center',
                    },
                    {
                        title: '点赞数',
                        key: 'supports',
                        align: 'center'
                    },
                    {
                        title: '评论数',
                        key: 'reviews',
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
                                on: {click: () => this.fnShowDelModal(p, true)}
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
                                on: {click: () => this.fnShowPostDetailsModel(p)}
                            }, '详情')
                        }
                    }
                ],
                aTableData: [],

                //详情弹出框
                bPostDetails: false,
                oPostInfo: {},
                aFileImages: [],
                aFileVideos: [],
                oCurVideoInfo: {},
                oCurImgInfo: {},
                oFileAudio: {},

                //评论表格
                aCommentList: [
                    {
                        type: 'index',
                        title: '序号',
                        align: 'center'
                    },
                    {
                        title: '回复人名称',
                        key: 'username',
                        align: 'center'
                    },
                    {
                        title: '头像',
                        key: 'head',
                        align: 'center',
                        render: (h, p) => {
                            return h(
                                'img', {
                                    style: {
                                        marginTop: '5px'
                                    },
                                    attrs: {
                                        src: p.row.head,
                                        width: '30px',
                                        height: '30px',
                                    }
                                })
                        }
                    },
                    {
                        title: '回复时间',
                        key: 'createDate',
                        align: 'center'
                    },
                    {
                        title: '回复内容',
                        key: 'content',
                        align: 'center',
                    },
                    {
                        title: '删除',
                        key: '',
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
                                on: {click: () => this.fnShowDelModal(p, false)}
                            }, '删除')
                        }
                    }
                ],
                aCmtTableData: [],
                iDtlCmtTotal: 0,
                iCurCmtPage: 1,
                iCurPostId: null,

                //视频弹出框
                bVideoModal: false,
                bImgModal: false,

                //帖子删除确认框
                bDelModal: false,
                bDelModalLoading: true,
                iDelCurId: null,
                bIsDelPost: true         //删帖为true，删评论为false
            }
        },

        created: function () {
            this.fnGetType();
            this.fnGetPostList();
        },
        methods: {
            fnGetType() {
                return axios.post('dictionary/searchThreshold', {
                    type: 'TopicType'
                })
                    .then(res => {
                        this.aTopicType = [...res.data];
                        this.aTopicType.push({id: 0, name: '全部'})
                    })
            },
            //获取帖子列表
            fnGetPostList() {
                return axios.post('topic/searchTopicsByParm', {
                    pageSize: 10,
                    currentPage: this.iCurrentPage,
                    param: {
                        topicVo: {
                            queryStr: this.sQueryStr || '',
                            queryDateQ: this.startDate || null,
                            queryDateZ: this.endDate || null,
                            typeCode: this.iPostType === '0' || this.iPostType === null ? null : Number(this.iPostType),
                            type1: 1,
                            sortStr: this.sortStr
                        }
                    }
                })
                        .then(res => {
                            this.aTableData = [...res.data.rows];
                            this.iTotalPages = res.data.total;
                        })
                        .catch(console.log);
            },
            fnGetPostDtl() {
                axios.post('topic/searchTopicDetail', {id: this.iCurPostId, parmType: 2})
                    .then(res => {
                        let aFileImages = [],
                            aFileVideos = [],
                            oFileAudio = {};
                        this.oPostInfo = Object.assign({}, res.data);
                        this.oPostInfo.tFileVos.forEach((ele) => {
                            if (ele.type === 1) {
                                ele.path = util.baseURL + ele.path;
                                aFileImages.push(ele);
                            } else if (ele.type === 2) {
                                ele.path = util.baseURL + ele.path.slice(2);
                                aFileVideos.push(ele);
                            } else {
                                ele.path = util.baseURL + ele.path.slice(2);
                                oFileAudio = ele;
                            }
                        });
                        this.aFileImages = aFileImages;
                        this.aFileVideos = aFileVideos;
                        this.oFileAudio = oFileAudio;
                    })

            },
            fnDelChoose() {
                if (this.bIsDelPost) {
                    this.fnDelPost();
                    return;
                }
                this.fnDelCmt();
            },
            fnDelPost() {
                axios.delete('topic/removeTopic', {data: {id: this.iDelCurId}})
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelModal = false, 1000))
                    .then(this.fnGetPostList)
                    .catch(err => util.fnHandleError.call(this, err)('bDelModalLoading'));
            },
            fnGetPostCmtList() {
                return axios.post('topic/searchTopicReviewsByParm', {
                        pageSize: 8,
                        currentPage: this.iCurCmtPage,
                        param: {
                            topicVo: {
                                id: this.iCurPostId
                            }
                        }
                    })
                    .then(res => {
                        this.aCmtTableData = [...res.data.rows];
                        this.iDtlCmtTotal = res.data.total;
                    })
                    .catch(console.log);
            },
            fnDelCmt(paramId) {
                axios.delete('topic/removeTopicReview', {data: {id: this.iDelCurId}})
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelModal = false, 1000))
                    .then(this.fnGetPostCmtList)
                    .catch(err => util.fnHandleError.call(this, err)('bDelModalLoading'));
            },
            fnShowPostDetailsModel(params) {
                this.bPostDetails = true;
                this.iCurPostId = params.row.id;
                this.fnGetPostDtl();
                this.fnGetPostCmtList();
            },
            fnShowDelModal(params, isDelPost) {
                this.iDelCurId = params.row.id;
                this.bDelModal = true;
                this.bIsDelPost = isDelPost;
            },
            fnShowVideoModal(index) {
                this.bVideoModal = true;
                this.oCurVideoInfo = this.aFileVideos[index];
            },
            fnShowImgModal(index) {
                this.bImgModal = true;
                this.oCurImgInfo = this.aFileImages[index];
            },
            //分页
            fnPagination(page){
                this.iCurrentPage = page;
                this.fnGetPostList();
            },
            fnDtlCmtPagination(page) {
                this.iCurCmtPage = page;
                this.fnGetPostCmtList();
            },
            fnGetListByTime(time){
                this.startDate = time[0];
                this.endDate = time[1];
                this.fnGetPostList();
            },
            fnShowAddOpr() {
                this.bPostDetails = true;
            }
        },
        mounted() {

        },
        destroyed() {
            console.log('destroyed');
        }
    }
</script>
