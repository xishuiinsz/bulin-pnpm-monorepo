
const tableData = [];
for (let i = 0; i < 100; i++) {
  tableData.push({
    id: i,
    date: '2016-05-03',
    name: 'Tom' + i,
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  });
}

export { tableData } 
