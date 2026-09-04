const pageData = {
  path: '/myComponents/multi-sources-trees',
  title: '多数据源树',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;
