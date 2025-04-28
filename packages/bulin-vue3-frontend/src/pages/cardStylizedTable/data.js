const tableData = [];
for (let i = 0; i < 100; i++) {
  const randomValue = Math.random();
  const randomNum = () => (randomValue * 100000 * (i + 1)).toFixed(randomValue > 0.5 ? 0 : 4);
  tableData.push({
    id: i,
    date: '2016-05-03',
    name: `Tom${i + 1}`,
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
    deposit: randomNum(),
  });
}

export { tableData };
