import { reactive } from 'vue';

const pageData = {
  path: '/myComponents/table-expand-collapse',
  title: '手工实现表格展开与收起',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue')
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;

export const tableData = reactive([
  {
    id: 1,
    date: '2016-05-02',
    name: '中国人民万岁',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: 2,
        date: '2016-05-04',
        name: '中国人民万岁',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: 3,
        date: '2016-05-01',
        name: '中国人民万岁',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: 31,
            date: '2016-05-01-01',
            name: '中国人民万岁',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: 32,
            date: '2016-05-01-02',
            name: '中国人民万岁',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: 4,
        date: '2016-05-03',
        name: '中国人民万岁',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  }
]);
