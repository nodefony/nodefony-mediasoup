import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';

import Rooms from '../views/rooms/Rooms.vue';
import EditRoom from '../views/rooms/EditRoom.vue';

import Meeting from '../views/meetings/Meeting.vue';
import Meetings from '../views/meetings/Meetings.vue';
import MeetingDetails from '../views/meetings/MeetingDetails.vue';

import Users from '../views/users/Users.vue';
import EditUser from '../views/users/EditUser.vue';

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
    component: EditRoom,
    props: true,
    beforeEnter: ifAuthenticated
 }, {
    path: '/meetings/join/:roomid',
    name: 'Meeting',
    props: true,
    component: Meeting,
    beforeEnter: ifAuthenticated,
    children: []
 }, {
    path: '/meetings',
    name: 'Meetings',
    component: Meetings,
    beforeEnter: ifAuthenticated,
 }, {
    path: '/meetings/:roomid',
    name: 'MeetingDetails',
    props: true,
    component: MeetingDetails,
    beforeEnter: ifAuthenticated,
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
