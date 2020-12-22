import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Rooms from '../views/Rooms.vue';
import Room from '../views/Room.vue';
import RoomLayout from '../views/layouts/Room.vue';

const ifAuthenticated = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    next();
    return;
  }
  next('Login');
  //document.location = `/app/mediasoup/login`;
};

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'Home',
    component: Home
}, {
    path: '/login',
    name: 'Login',
    component: Login
}, {
    path: '/about',
    name: 'About',
    component: () =>
      import( /* webpackChunkName: "about" */ '../views/About.vue')
 }, {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms,
    beforeEnter: ifAuthenticated
 }, {
    path: '/room/:roomid',
    name: 'Room',
    props: true,
    component: Room,
    beforeEnter: ifAuthenticated
 },{
   path: '/layout/room',
   name: 'RoomLayout',
   component: RoomLayout,
 }
];

const router = new VueRouter({
  mode: 'history',
  base: `${process.env.BASE_URL}`,
  //base: '/mediasoup/',
  routes
});

export default router;
