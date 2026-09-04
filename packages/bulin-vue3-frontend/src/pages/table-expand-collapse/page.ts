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

export const tableList = [
  {
    id: generateUniqueId('id-'),
    surname: '张三丰',
    slogan: '布林前端开源平台布林前端开源平台',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        surname: '张启迪',
        slogan: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        surname: '张明星',
        slogan: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            surname: '张明天',
            slogan: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            surname: '张明白',
            slogan: '布林前端开源平台布林前端开源平台',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        surname: '张明理',
        slogan: '布林前端开源平台布林前端开源平台',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  },
  {
    id: generateUniqueId('id-'),
    surname: '李世民',
    slogan: '张明楷是我的好宝贝呀',
    address: 'No. 189, Grove St, Los Angeles',
    childrenList: [
      {
        id: generateUniqueId('id-'),
        surname: '李想啥',
        slogan: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles'
      },
      {
        id: generateUniqueId('id-'),
        surname: '李泽楷',
        slogan: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles',
        childrenList: [
          {
            id: generateUniqueId('id-'),
            surname: '李想丰富',
            slogan: '张明楷是我的好宝贝呀',
            address: 'No. 189, Grove St, Los Angeles'
          },
          {
            id: generateUniqueId('id-'),
            surname: '李叫啥',
            slogan: '张明楷是我的好宝贝呀',
            address: 'No. 189, Grove St, Los Angeles'
          }
        ]
      },
      {
        id: generateUniqueId('id-'),
        surname: '李是谁',
        slogan: '张明楷是我的好宝贝呀',
        address: 'No. 189, Grove St, Los Angeles'
      }
    ]
  }
];
