const pageData = {
  path: '/myComponents/auto-generate-page',
  title: '自动生成页面的模板',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;
