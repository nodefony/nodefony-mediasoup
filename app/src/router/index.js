import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Rooms from '../views/Rooms.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'

const ifAuthenticated = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    next();
    return;
  }
  next('login');
  document.location = `/app/login`;
};

Vue.use(VueRouter)

const routes = [{
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/home',
    name: 'Home',
    component: Rooms
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
    component: Rooms,
    beforeEnter: ifAuthenticated
 }, {
    path: '/meeting/:roomid',
    name: 'MettingAuth',
    props: true,
    component: Rooms,
    beforeEnter: ifAuthenticated
  }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  //base: '/mediasoup/',
  routes
})

export default router
