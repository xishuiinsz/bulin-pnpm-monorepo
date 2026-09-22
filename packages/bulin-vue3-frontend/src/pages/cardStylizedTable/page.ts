export default {
  path: '/myComponents/cardStylizedTable',
  title: '卡片化表格',
  hasChild: false,
  order: 1,
  // 菜单分组，声明该菜单项挂载在左侧菜单的哪个一级分组下，缺省为“练习场”
  menuGroup: '表格专场',
  component: () => import('./index.vue'),
};
