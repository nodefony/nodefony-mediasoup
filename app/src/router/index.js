import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Rooms from '../views/rooms/Rooms.vue';
import Room from '../views/rooms/Room.vue';
import createRoom from '../views/rooms/createRoom.vue';

import Users from '../views/users/Users.vue';
import EditUser from '../views/users/EditUser.vue';
//import RoomLayout from '../views/layouts/Room.vue';

const ifAuthenticated = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    return next();
  }
  //next('Login');
  document.location = `/app/login`;
};

const allReadyLogin = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    return next('Home');
  }
  return next();
};

Vue.use(VueRouter)

const routes = [{
    path: '/',
    alias: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: ifAuthenticated
}, {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: allReadyLogin
}, {
    path: '/logout',
    name: 'Logout',
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
    beforeEnter: ifAuthenticated,
    children: []
 }, {
    path: '/room/:roomid',
    name: 'Room',
    props: true,
    component: Room,
    beforeEnter: ifAuthenticated,
    children: []
 }, {
    path: '/create',
    name: 'createRoom',
    component: createRoom,
    beforeEnter: ifAuthenticated
 }, {
    path: '/users',
    name: 'Users',
    beforeEnter: ifAuthenticated,
    component: Users
 }, {
    path: '/user/:username',
    name: 'User',
    props: true,
    beforeEnter: ifAuthenticated,
    component: EditUser
 }
];

const router = new VueRouter({
  mode: 'history',
  base: `${process.env.BASE_URL}`,
  //base: '/mediasoup/',
  routes
});

export default router;
