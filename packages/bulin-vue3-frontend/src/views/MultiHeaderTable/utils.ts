export const columns = [
  {
    id: 'companyName',
    label: '公司名称',
    prop: 'companyName',
    width: '150',
    align: 'center'
  },
  {
    id: 'personalInfo',
    label: '个人信息',
    align: 'center',
    children: [
      {
        id: 'employeeInfo',
        label: '员工信息',
        align: 'center',
        children: [
          {
            id: 'name',
            label: '姓名',
            prop: 'name',
            width: '100',
            align: 'center'
          },
          {
            id: 'age',
            label: '年龄',
            prop: 'age',
            width: '80',
            align: 'center',
            sortable: true
          },
          {
            id: 'department',
            label: '部门',
            prop: 'department',
            width: '120',
            align: 'center'
          },
          {
            id: 'position',
            label: '职位',
            prop: 'position',
            width: '120',
            align: 'center'
          }
        ]
      },
      {
        id: 'contactInfo',
        label: '联系方式',
        align: 'center',
        children: [
          {
            id: 'phone',
            label: '电话',
            prop: 'phone',
            width: '120',
            align: 'center'
          },
          {
            id: 'email',
            label: '邮箱',
            prop: 'email',
            width: '200',
            align: 'center'
          }
        ]
      }
    ]
  }
];

export const tableData = [
  {
    companyName: '阿里巴巴',
    companyCode: 'AL001',
    establishDate: '1999-09-10',
    revenue: '717289',
    profit: '150567',
    growthRate: '8.5',
    stockCode: 'BABA',
    stockPrice: '87.50',
    name: '张三',
    age: 35,
    department: '技术部',
    position: '高级工程师',
    phone: '13800138000',
    email: 'zhangsan@alibaba.com',
    q1Score: 85,
    q2Score: 88,
    q3Score: 90,
    q4Score: 92,
    annualScore: 88.75,
    ranking: 12
  },
  {
    companyName: '腾讯科技',
    companyCode: 'TEC001',
    establishDate: '1998-11-11',
    revenue: '554552',
    profit: '188728',
    growthRate: '10.2',
    stockCode: '00700',
    stockPrice: '320.80',
    name: '李四',
    age: 28,
    department: '产品部',
    position: '产品经理',
    phone: '13900139000',
    email: 'lisi@tencent.com',
    q1Score: 78,
    q2Score: 82,
    q3Score: 85,
    q4Score: 88,
    annualScore: 83.25,
    ranking: 25
  },
  {
    companyName: '菊花技术',
    companyCode: 'HW001',
    establishDate: '1987-09-15',
    revenue: '642340',
    profit: '35678',
    growthRate: '0.9',
    stockCode: '未上市',
    stockPrice: '--',
    name: '王五',
    age: 42,
    department: '研发部',
    position: '架构师',
    phone: '13700137000',
    email: 'wangwu@huawei.com',
    q1Score: 92,
    q2Score: 94,
    q3Score: 95,
    q4Score: 96,
    annualScore: 94.25,
    ranking: 3
  }
];
