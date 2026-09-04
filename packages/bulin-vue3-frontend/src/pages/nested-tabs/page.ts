import { reactive } from 'vue';

const pageData = {
  path: '/myComponents/nested-tabs',
  title: 'Tabs嵌套',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export const dataScope = reactive({
  key: 'dataScopeKey',
  label: '数据范围',
  isChecked: true,
  children: [
    {
      key: 'Q1',
      label: '第一季度',
      isChecked: true,
      children: [{
        key: 'Jan',
        label: '1月份',
        isChecked: true,
      }, {
        key: 'Feb',
        label: '2月份',
        isChecked: true,
      }, {
        key: 'Mar',
        label: '3月份',
        isChecked: true,
      }],
    },
    {
      key: 'Q2',
      label: '第二季度',
      isChecked: true,
      children: [{
        key: 'Apr',
        label: '4月份',
        isChecked: true,
      }, {
        key: 'May',
        label: '5月份',
        isChecked: true,
      }, {
        key: 'Jun',
        label: '6月份',
        isChecked: true,
      }],
    },
  ],
});

export default pageData;
