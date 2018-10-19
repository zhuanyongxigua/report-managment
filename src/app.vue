<style scoped>
    @import 'styles/common.css';
</style>
<template>
    <div>
        <router-view :key="key"></router-view>
    </div>
</template>
<script>
    export default {
        data () {
            return {}
        },
        created () {
        },
        computed: {
            key() {
                return this.$route.name !== undefined? this.$route.name + +new Date(): this.$route + +new Date()
            }
        }
    }
</script>
