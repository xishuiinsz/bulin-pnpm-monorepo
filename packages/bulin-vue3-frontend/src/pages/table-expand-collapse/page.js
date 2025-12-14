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
    date: '张三丰',
    name: '布林前端开源平台布林前端开源平台',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        date: '张启迪',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        date: '张明星',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            date: '张明天',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            date: '张明白',
            name: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        date: '张明理',
        name: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  },
  {
    id: generateUniqueId('id-'),
    date: '李世民',
    name: '张明楷是我的好宝贝呀',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        date: '李想啥',
        name: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        date: '李泽楷',
        name: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            date: '李想丰富',
            name: '张明楷是我的好宝贝呀',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            date: '李叫啥',
            name: '张明楷是我的好宝贝呀',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        date: '李是谁',
        name: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  }
]);


