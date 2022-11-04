import Calendar from '@bundles/calendar-bundle/Resources/vue/views/Calendar.vue';

const routes = [{
  path: '/calendar/:id',
  name: 'Calendar',
  props: true,
  component: Calendar
}];


export default routes;
