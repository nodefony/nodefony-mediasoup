import Calendar from '@bundles/calendar-bundle/Resources/vue/views/Calendar.vue';

const routes = [{
  path: '/calendar/:id',
  name: 'Calendar',
  props: true,
  //beforeEnter: ifAuthenticated,
  component: Calendar
}];


export default routes;
