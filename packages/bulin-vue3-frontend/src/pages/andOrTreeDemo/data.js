export const treeData = {
  type: '或',
  id: 1744981421208,
  level: 1,
  children: [
    {
      type: '与',
      level: 2,
      id: 1744981421209,
      children: [
        { type: 'LEAF', value: 'A', level: 3, id: 1744981421210 },
        { type: 'LEAF', value: 'B', level: 3, id: 1744981421211 },
        { type: 'LEAF', value: 'B', level: 3, id: 1744981421212 },
      ],
    },
    {
      type: '与',
      id: 1744981421232,
      level: 2,
      children: [
        { type: 'LEAF', value: 'C', level: 3, id: 1744981421213 },
        {
          type: '或',
          id: 1744981421214,
          level: 3,
          children: [
            { type: 'LEAF', value: 'D', level: 4, id: 1744981421215 },
            { type: 'LEAF', value: 'E', level: 4, id: 1744981421216 },
          ],
        },
      ],
    },
  ],
};
