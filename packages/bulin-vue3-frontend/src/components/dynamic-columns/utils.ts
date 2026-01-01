import { ElTableColumn } from 'element-plus';
import { h, type ExtractPublicPropTypes } from 'vue';
import { Calendar } from '@element-plus/icons-vue';

export type ElTableColumnProps = ExtractPublicPropTypes<InstanceType<typeof ElTableColumn>> & {
  children?: ElTableColumnProps[];
};

export const tableColumns = [
  {
    label: '时间',
    prop: 'date',
    width: 150,
    slots: {
      header: (data: { column: ElTableColumnProps }) => {
        return h('div', { class: 'd-flex align-items-center' }, [
          data.column.label,
          h(Calendar, { style: 'width: 16px; height: 16px; margin-left: 4px;' })
        ]);
      }
    }
  },
  {
    label: 'Delivery Info',
    headerAlign: 'center',
    children: [
      { label: 'Name', prop: 'name', width: 120 },
      {
        label: 'Address Info',
        headerAlign: 'center',
        children: [
          { label: 'State', prop: 'state', width: 120 },
          { label: 'City', prop: 'city', width: 150 },
          { label: 'Address', prop: 'address' },
          { label: 'Zip', prop: 'zip', width: 150 }
        ]
      }
    ]
  }
];

export const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  }
] as const;
