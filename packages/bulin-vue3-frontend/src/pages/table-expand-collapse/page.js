import { reactive } from 'vue';
import { generateUniqueId } from '@libc/shared';

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
    id: generateUniqueId('id-'),
    date: '2016-05-02',
    name: '布林前端开源平台布林前端开源平台',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        date: '2016-05-04',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        date: '2016-05-01',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            date: '2016-05-01-01',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            date: '2016-05-01-02',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        date: '2016-05-03',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  },
  {
    id: generateUniqueId('id-'),
    date: '2016-05-02',
    name: '布林前端开源平台布林前端开源平台',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        date: '2016-05-04',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        date: '2016-05-01',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            date: '2016-05-01-01',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            date: '2016-05-01-02',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        date: '2016-05-03',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  }
]);
