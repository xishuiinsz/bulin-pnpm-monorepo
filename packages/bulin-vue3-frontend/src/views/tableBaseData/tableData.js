import showDrawer from '@/imperatives/showDrawer.js';
import { User } from '@element-plus/icons-vue';
import { ElImage } from 'element-plus';
import { h, reactive } from 'vue';
import detailsForm from './detailsForm.vue';

function nameClick(data) {
  let drawerInstance = null;
  const params = {
    title: '用户详情',
    size: 600,
    slots: {
      default: () => h(detailsForm, { close: drawerInstance?.destroy, initialFormData: { ...data } }),
    },
  };
  drawerInstance = showDrawer(params);
}

export const tableColumnList = [
  { type: 'selection', width: 55 },
  { prop: 'id', label: 'ID', width: 55 },
  {
    prop: 'name',
    label: '用户名',
    width: 120,
    slots: {
      header: data =>
        h('span', { class: 'd-flex align-items-center' }, [
          data.column.label,
          h(User, { class: 'ml8', style: { width: '16px', height: '16px' } }),
        ]),
      default: ({ row }) => h('span', { class: 'cursor-pointer color-0d6efd', onClick: () => nameClick(row) }, row.name),
    },

  },
  {
    prop: 'money',
    label: '账户余额',
    width: 120,
    sortable: true,
    slots: {
      default: ({ row }) => `￥${row.money}`,
    },
  },
  {
    prop: 'thumb',
    label: '头像(查看大图)',
    className: 'thumb-column',
    width: 200,
    slots: {
      default: ({ row }) =>
        h(ElImage, { 'class': 'table-td-thumb', 'src': row.thumb, 'preview-src-list': [row.thumb], 'preview-teleported': true }),
    },

  },
  { prop: 'address', label: '地址' },
  {
    prop: 'state',
    label: '状态',
    width: 80,
    filters: [
      { text: '成功', value: '成功' },
      { text: '失败', value: '失败' },
    ],
  },
  { prop: 'date', label: '注册日期', width: 120 },

];

export const tableDataList = reactive([
  {
    id: 1,
    name: '张三',
    money: 123,
    address: '广东省东莞市长安镇',
    state: '成功',
    date: '2019-11-1',
    thumb: 'https://cn.element-plus.org/images/mele-banner.png',
  },
  {
    id: 2,
    name: '李四',
    money: 456,
    address: '广东省广州市白云区',
    state: '成功',
    date: '2019-10-11',
    thumb: 'https://cn.element-plus.org/images/jnpfsoft.png',
  },
  {
    id: 3,
    name: '王五',
    money: 789,
    address: '湖南省长沙市',
    state: '失败',
    date: '2019-11-11',
    thumb: 'https://cn.element-plus.org/images/CRMEB-l.png',
  },
  {
    id: 4,
    name: '赵六',
    money: 1011,
    address: '福建省厦门市鼓浪屿',
    state: '成功',
    date: '2019-10-20',
    thumb: 'https://cn.element-plus.org/images/buildadmin-l.png',
  },
]);
