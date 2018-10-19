<style scoped>
    .ivu-tag-dot {
        line-height: 40px;
        border: 1px solid #57a3f3!important;
    }

    .ivu-tag-dot-inner {
        width: 15px;
        height: 15px;
        margin-right: 6px;
    }

    .ivu-tag {
        font-size: 15px;
    }

    .role_float_box {
        width: 180px;
        margin-top: 10px;
        float: left;
    }

    .clear_float {
        margin-left: 25px;
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
            <Button style="margin-left: 10px;float: left" type="primary" @click="fnShowModal('oScoreInfo')">新建角色</Button>
        </div>
        <div class="center_box">
            <Tag
                    v-for="(item, index) in aRoles"
                    :name="item.id"
                    type="dot"
                    style="height: 40px;margin-left: 20px;"
                    @click.native="fnShowModal(index)"
                    @on-close="handleClose"
                    color="#57a3f3"
                    closable>{{item.name}}</Tag>
        </div>

        <Modal
                title="详情信息"
                v-model="bModal"
                :loading="bModalLoading"
                @on-ok="fnCreateRole('oScoreInfo')"
                @on-cancel="fnResetPermission('oScoreInfo')"
                class-name="vertical-center-modal" width="600">
            <Form style="margin-left: -10px; margin-right: 10px; margin-top: 10px;"
                  ref="oScoreInfo"
                  :model="oScoreInfo"
                  :rules="oScoreInfoRules"
                  :label-width="100">
                <Form-item label="角色名称" prop="name">
                    <Input v-model="oScoreInfo.name" placeholder="角色名称"></Input>
                </Form-item>
            </Form>

            <div class="clear_float">
                <div v-for="item in aAllPermission" class="role_float_box">
                    <i-switch v-model="oCurPermission[item.id]" size="large">
                        <span slot="open">On</span>
                        <span slot="close">Off</span>
                    </i-switch>
                    <span v-text="item.name"></span>
                </div>
            </div>
        </Modal>

        <Modal
                v-model="bDelRole"
                title="确认删除"
                :loading="bDelRoleLoading"
                @on-ok="fnDelRole">
            <p>您确认要删除此角色？</p>
        </Modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'rolePowerMgt',
        data () {
            return {
                aRoles: [],
                aAllPermission: [],
                oCurPermission: {},
                //规则弹出框
                bModal: false,
                oScoreInfoStore: {},
                bModalLoading: true,

                //表单
                oScoreInfo: {
                    name: ''
                },
                oScoreInfoRules: {
                    name: [
                        {required: true, message: '角色名称不能为空', trigger: 'blur'}
                    ]
                },

                bDelRole: false,
                bDelRoleLoading: true,
                iCurDelId: null,

                //修改或者创建
                sCurFunction: '',
                iCurModifyId: null
            }
        },

        created: function () {
            this.fnGetRoleList();
            this.fnGetAllPermision();
        },
        methods: {
            fnGetAllPermision() {
                return axios.post('role/searchPermissions', {})
                    .then(res => {
                        this.aAllPermission = [...res.data];
                        res.data.forEach((ele) => {
                            this.oCurPermission[ele.id] = false;
                        })
                    })
                    .catch(console.log);
            },
            fnGetRoleList() {
                return axios.post('operator/searchAuthGroups', {})
                        .then(res => {
                            this.aRoles = [...res.data];
                        })
                        .catch(console.log);
            },
            fnCreateRole(name) {
                let aPermission = [];
                let url = '';
                let postData = {};
                for (let index in this.oCurPermission) if (this.oCurPermission[index]) aPermission.push(parseFloat(index));
                if (this.sCurFunction === 'modify') {
                    url = 'modifyGroup';
                    postData.id = this.iCurModifyId;
                    postData.name = this.oScoreInfo.name;
                    postData.authPermissions = aPermission;
                } else {
                    url = 'addGroup';
                    postData.name = this.oScoreInfo.name;
                    postData.authPermissions = aPermission;
                }
                util.fnValidateInfo.call(this, name)
                    .then(res => axios.put('role/' + url, postData))
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bModal = false, 1000))
                    .then(this.fnGetRoleList)
                    .catch(err => util.fnHandleError.call(this, err)('bModalLoading'))
            },
            fnDelRole() {
                axios.delete('role/removeGroup', {data: {id: this.iCurDelId}})
                    .then(util.fnHandleSuccess.bind(this))
                    .then(res => setTimeout(() => this.bDelRole = false, 1000))
                    .then(this.fnGetRoleList)
                    .catch(err => util.fnHandleError.call(this, err)('bDelRoleLoading'))
            },
            fnShowModal(param) {
                this.bModal = true;
                if (typeof param === 'number') {
                    this.iCurModifyId = this.aRoles[param].id;
                    this.sCurFunction = 'modify';
                    axios.post('role/searchAuthGroup', {
                        id: this.aRoles[param].id
                    })
                        .then(res => {
                            this.oScoreInfo = JSON.parse(JSON.stringify(res.data));
                            res.data.authPermissions.forEach((ele) => {
                                this.oCurPermission[ele] = true;
                            })

                        })
                        .catch(console.log);
                } else {
                    this.$refs[param].resetFields();
                    this.sCurFunction = 'add';
                }
            },
            handleClose(event, id) {
                this.iCurDelId = id;
                this.bDelRole = true;
            },
            fnResetPermission(name) {
                this.oCurPermission = {};
                this.$refs[name].resetFields();
            }
        }
    }
</script>
