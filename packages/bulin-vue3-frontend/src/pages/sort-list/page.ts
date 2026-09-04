const pageData = {
  path: '/myComponents/sort-list',
  title: '排序列表',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;
