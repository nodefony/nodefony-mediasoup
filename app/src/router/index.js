import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';

import Rooms from '../views/rooms/Rooms.vue';
import EditRoom from '../views/rooms/EditRoom.vue';

import Meeting from '../views/meetings/Meeting.vue';
import HomeMeeting from '../views/meetings/HomeMeeting.vue';
import JoinMeeting from '../views/meetings/JoinMeeting.vue';
import Meetings from '../views/meetings/Meetings.vue';
import MeetingDetails from '../views/meetings/MeetingDetails.vue';

import Users from '../views/users/Users.vue';
import EditUser from '../views/users/EditUser.vue';

import PageNotFound from '../views/404';

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

let mainRoute = [{
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
  alias: '/rooms/home',
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
  name: 'JoinMeeting',
  props: true,
  component: JoinMeeting,
  children: []
 }, {
  path: '/meetings/home/:roomid',
  name: 'HomeMeeting',
  props: true,
  component: HomeMeeting,
 }, {
  path: '/meetings/enter/:roomid',
  name: 'Meeting',
  props: true,
  component: Meeting,
 }, {
  path: '/meetings',
  alias: '/meetings/home',
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
  alias: '/users/home',
  name: 'Users',
  beforeEnter: ifAuthenticated,
  component: Users
 }, {
  path: '/user/:username',
  name: 'User',
  props: true,
  beforeEnter: ifAuthenticated,
  component: EditUser
}];

let routes = null;
// calendar
import calendarRoutes from '@/../../src/bundles/calendar-bundle/Resources/vue/routes/routes.js';
routes = mainRoute.concat(calendarRoutes);

// dev routes
import devRoute from './dev.index.js';
if( process.env.VUE_APP_NODE_ENV){
  routes = routes.concat(devRoute);
}

// tool routes
routes.push({
  // and finally the default route, when none of the above matches:
  path: "*",
  component: PageNotFound
})

const router = new VueRouter({
  mode: 'history',
  base: `${process.env.BASE_URL}`,
  routes
});

export default router;
