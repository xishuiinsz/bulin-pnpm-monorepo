const pageData = {
  path: '/myComponents/safe-nitpicking',
  title: '安全找茬',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;
