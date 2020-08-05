import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/home',
    name: 'Home',
    component: Home
  }, {
    path: '/',
    name: 'About',
    //route level code-splitting
    //this generates a separate chunk (about.[hash].js) for this route
    //which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "about" */ '../views/About.vue')
 }, {
    path: '/meeting/:roomid/:peerid/',
    name: 'Metting',
    props: true,
    component: () =>
      import( /* webpackChunkName: "meeting" */ '../views/Home.vue')
 }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  //base: '/mediasoup/',
  routes
})

export default router
