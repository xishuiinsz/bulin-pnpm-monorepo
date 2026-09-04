const pageData = {
  path: '/myComponents/sort-list',
  title: '排序列表',
  hasChild: false,
  order: 1,
  component: () => import('./index.vue'),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf('/') + 1);

export default pageData;

const testData = [
  { id: '1', name: '选项1' },
  { id: '2', name: '选项2' },
  { id: '3', name: '选项3' },
  { id: '4', name: '测试-选项4' },
  { id: '5', name: '测试-选项5' },
  { id: '6', name: '选项6' },
  { id: '7', name: '选项7' },
  { id: '8', name: '选项8' },
  { id: '9', name: '选项9' },
];

interface NodeItem {
  id: string;
  name: string;
  children?: Array<NodeItem>;
}

export const convertChildren = ({ list, sign, separator = '-' }: { list: Array<NodeItem>; sign: string; separator?: string }) => {
  const result: string[] = [];
  const excludeList = list.filter((item) => !item.name?.startsWith(sign));
  const includeList = list.filter((item) => item.name?.startsWith(sign));
  if (!includeList.length) {
    return list;
  }
  const firstIncludeItem = includeList[0];
  if (!firstIncludeItem) {
    return list;
  }
  const index = list.findIndex((item) => item.name?.startsWith(sign));
  const id = includeList.map((item) => item.id).join(separator);
  const children = includeList.map((item) => {
    return { id: item.id, name: item.name.replace(sign + separator, '') };
  });
  const element = { id, name: sign, children };
  excludeList.splice(index, 0, element);
  return excludeList;
}

const flatChildren = (list: Array<NodeItem>): Array<NodeItem> => {
  return list.map(item => {
    if (item.children && item.children.length) {
      return flatChildren(item.children);
    }
    return item
  }).flat();
}
