export default {
  path: '/myComponents/five-in-a-row',
  title: '五子棋',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const length = 15;
