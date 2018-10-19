import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const oPage404 = {
    template: `
        <div>
            <h2>url error, page not found</h2>
        </div>
    `
}

const routers = new VueRouter({
    // mode: 'history',
    base:__dirname,
    routes: [{
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'login',
            component: (resolve) => require(['./views/login.vue'], resolve)
        },
        {
            path: '/index',
            component: (resolve) => require(['./views/index.vue'], resolve)
        },
        {
            path: '*',
            component: oPage404
        }
    ]
});

export default routers;
