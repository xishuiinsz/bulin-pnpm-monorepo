import MultiTextWithMore from '@/components/MultiTextWithMore.vue';
import showDrawer from '@/imperatives/showDrawer.js';
import { User } from '@element-plus/icons-vue';
import { ElImage, ElMessage } from 'element-plus';
import { h, reactive } from 'vue';
import detailsForm from './detailsForm.vue';
import NumbericFormatter from '@/components/NumbericFormatter.vue';

function nameClick(data) {
  let drawerInstance = null;
  const params = {
    title: '用户详情',
    size: 600,
    slots: {
      default: () => h(detailsForm, { close: drawerInstance?.destroy, initialFormData: { ...data } })
    }
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
      header: (data) =>
        h('span', { class: 'd-flex align-items-center' }, [
          data.column.label,
          h(User, { class: 'ml8', style: { width: '16px', height: '16px' } })
        ]),
      default: ({ row }) => h('span', { class: 'cursor-pointer color-0d6efd', onClick: () => nameClick(row) }, row.name)
    }
  },
  {
    prop: 'money',
    label: '账户余额',
    width: 120,
    sortable: 'custom',
    slots: {
      default: ({ row }) => {
        const value = row.money;
        const slots = {};
        if (value) {
          Object.assign(slots, { suffix: () => h('span', {}, ' ¥') });
        }
        return h(NumbericFormatter, { value }, slots);
      }
    }
  },
  {
    prop: 'thumb',
    label: '头像(查看大图)',
    className: 'thumb-column',
    width: 200,
    slots: {
      default: ({ row }) =>
        h(ElImage, {
          class: 'table-td-thumb',
          src: row.thumb,
          'preview-src-list': [row.thumb],
          'preview-teleported': true
        })
    }
  },
  { prop: 'address', label: '地址' },
  {
    prop: 'hobbies',
    label: '爱好',
    minWidth: 180,
    slots: {
      default: ({ row }) => {
        if (!row.hobbies?.trim()) {
          return '--';
        }
        const moreClick = () => {
          ElMessage({ type: 'success', message: row.hobbies, customClass: 'max-width-600' });
        };
        return h(MultiTextWithMore, { content: row.hobbies, moreClick });
      }
    }
  },
  {
    prop: 'state',
    label: '状态',
    width: 80,
    filters: [
      { text: '成功', value: '成功' },
      { text: '失败', value: '失败' }
    ]
  },
  { prop: 'date', label: '注册日期', width: 120 }
];

export const tableDataList = reactive([
  {
    id: 4,
    name: '赵六',
    money: '123456.789',
    address: '福建省厦门市鼓浪屿',
    hobbies: '玩手机、看电视、打游戏、看小说、听音乐、旅游、美食、运动、吃鸡腿、吃零食',
    state: '成功',
    date: '2019-10-20',
    thumb: 'https://cn.element-plus.org/images/buildadmin-l.png'
  },
  {
    id: 1,
    name: '张三',
    money: 123456.789,
    address: '广东省东莞市长安镇',
    hobbies:
      '1、运动类：篮球、羽毛球、、跑步、跳绳、举重；2、娱乐类：听音乐、看电影、绘画、写小说、看书；3、冒险类：做弹弓玩、做木剑玩、做橡皮枪玩；4、返老还童类：积木、用麻将搭金字塔；5、智力类：拼图、拆装（拆小汽车、闹钟、电风扇之类的）；6、收藏类：收藏扑克牌、小汽车、手表、鞋之类的；7、乐器类：弹吉他、钢琴、萨克斯、葫芦丝、大号、小号；8、文艺类：折纸（可以尝试无限种折纸飞机的办法）、剪纸、品茶、涂鸦；',
    state: '成功',
    date: '2019-11-1',
    thumb: 'https://cn.element-plus.org/images/mele-banner.png'
  },
  {
    id: 2,
    name: '李四',
    address: '广东省广州市白云区',
    hobbies:
      '1、冒险类：做弹弓玩、做木剑玩、做橡皮枪玩；2、娱乐类：听音乐、看电影、绘画、写小说、看书；3、运动类：篮球、羽毛球、、跑步、跳绳、举重；4、返老还童类：积木、用麻将',
    state: '成功',
    date: '2019-10-11',
    thumb: 'https://cn.element-plus.org/images/jnpfsoft.png'
  },
  {
    id: 3,
    name: '王五',
    money: 789,
    address: '湖南省长沙市',
    hobbies: '编写js代码',
    state: '失败',
    date: '2019-11-11',
    thumb: 'https://cn.element-plus.org/images/CRMEB-l.png'
  },
  {
    id: 4,
    name: '合计',
    money: 247702.578,
    address: '-',
    hobbies: '',
    state: '-',
    date: '2019-11-11',
    thumb: 'https://cn.element-plus.org/images/CRMEB-l.png'
  }
]);
