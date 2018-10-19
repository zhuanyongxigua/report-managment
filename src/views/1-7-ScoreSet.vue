<style scoped>
    .input_class {
        font-size: 14px;
        padding: 6px 7px;
        height: 36px;
        font-family: inherit;
        display: inline-block;
        height: 32px;
        line-height: 1.5;
        padding: 4px 7px;
        font-size: 12px;
        border: 1px solid #dddee1;
        border-radius: 4px;
        color: #495060;
        background-color: #fff;
        background-image: none;
        position: relative;
        cursor: text;
        transition: border .2s;
        margin-right: 15px;
        width: 162px;
    }
    .label_span {
        display: inline-block;
        width: 120px;
    }

    .input_box {
        margin-top: 25px;
    }

    .input_class:focus, .input_class:hover {
        border-color: #57a3f3;
        outline-width: 0px;
    }

    .ivu-btn {
        margin-bottom: 1px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
    }

    .input_append {
        display: inline-block;
        border: 1px solid #dddee1;
        border-radius: 0px 4px 4px 0px;
        padding: 6px;
        margin-left: -5px;
        margin-right: 15px;
        width: 27px;
        background-color: #eee;
    }

    .input_content {
        margin-right: 0px;
        border-radius: 4px 0px 0px 4px;
        width: 137px;
    }
</style>

<template>
    <div class="center_box">
        <div class="input_box">
            <span class="label_span">发帖赠送积分数:</span>
            <input class="input_class" type="number" v-model="sPostScore.name">
            <Button type="primary" @click="fnModifyScoreRule('post')">保存</Button>
        </div>
        <div class="input_box">
            <span class="label_span">评论赠送积分数:</span>
            <input class="input_class" type="number" v-model="sCmtScore.name">
            <Button type="primary" @click="fnModifyScoreRule('review')">保存</Button>
        </div>
        <div class="input_box">
            <span class="label_span">提现比例(/1元):</span>
            <input class="input_class" type="number" v-model="sWithdrawRatio.name">
            <Button type="primary" @click="fnModifyScoreRule('withdraw')">保存</Button>
        </div>
        <div class="input_box">
            <span class="label_span">提现手续费:</span>
            <input class="input_class input_content" type="number" v-model="sWithdrawFee.name">
            <div class="input_append">%</div>
            <Button type="primary" @click="fnModifyScoreRule('fee')">保存</Button>
        </div>
        <div class="input_box">
            <span class="label_span">注册送积分数:</span>
            <input class="input_class" type="number" v-model="sSignUpScore.name">
            <Button type="primary" @click="fnModifyScoreRule('register')">保存</Button>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import util from '../libs/util';
    export default {
        name: 'ScoreSet',
        data () {
            return {
                sPostScore: {},
                sCmtScore: {},
                sWithdrawRatio: {},
                sWithdrawFee: {},
                sSignUpScore: {}
            }
        },
        created : function () {
            this.fnGetCurScoreRule();
        },
        methods: {
            fnGetCurScoreRule() {
                return axios.post('dictionary/searchThreshold', {
                        type: "CreditSet"
                    })
                    .then(res => {
                        res.data.forEach((ele) => {
                            switch (ele.code) {
                                case 'post':
                                    this.sPostScore = ele;
                                    break;
                                case 'review':
                                    this.sCmtScore = ele;
                                    break;
                                case 'withdraw':
                                    this.sWithdrawRatio = ele;
                                    break;
                                case 'fee':
                                    this.sWithdrawFee = ele;
                                    break;
                                case 'register':
                                    this.sSignUpScore = ele;
                                    break;
                            }
                        })
                    })
                    .catch(console.log);
            },
            fnModifyScoreRule(name) {
                let postData = {};
                switch (name) {
                    case 'post':
                        if (!this.fnIsInteger(this.sPostScore.name, '发帖赠送积分数')) return;
                        postData.id = this.sPostScore.id;
                        postData.name = this.sPostScore.name;
                        break;
                    case 'review':
                        if (!this.fnIsInteger(this.sCmtScore.name, '评论赠送积分数')) return;
                        postData.id = this.sCmtScore.id;
                        postData.name = this.sCmtScore.name;
                        break;
                    case 'withdraw':
                        if (!this.fnIsInteger(this.sWithdrawRatio.name, '提现比例')) return;
                        postData.id = this.sWithdrawRatio.id;
                        postData.name = this.sWithdrawRatio.name;
                        break;
                    case 'fee':
                        if (isNaN(param)) {
                            this.$Message.error('提现手续费应该是正确数字');
                            return;
                        }
                        postData.id = this.sWithdrawFee.id;
                        postData.name = this.sWithdrawFee.name;
                        break;
                    case 'register':
                        if (!this.fnIsInteger(this.sSignUpScore.name, '注册送积分数')) return;
                        postData.id = this.sSignUpScore.id;
                        postData.name = this.sSignUpScore.name;
                        break;
                }
                return axios.put('dictionary/modifyThreshold', postData)
                    .then(util.fnHandleSuccess.bind(this))
                    .then(this.fnGetCurScoreRule)
                    .catch(util.fnHandleError.bind(this));
            },
            fnIsInteger(param, words) {
                param = parseFloat(param);
                if (param) {
                    if (param % 1 !== 0) {
                        this.$Message.error(words + '只能是整数');
                        return false;
                    }
                    return true;
                } else {
                    this.$Message.error(words + '应该是正确数字');
                    return false;
                }
            }
        }
    }
</script>
