const path = require('path')
const fs = require('fs')
/**
 * 获取 图片 列表数据
 */
exports.getImagesList = (req, res) => {
  const imagesDir = path.join(__dirname, '../public/images');
  try {
    const files = fs.readdirSync(imagesDir,)
    const list = files.map((file) => {
      return { name: file, size: fs.statSync(path.join(imagesDir, file)).size }
    })
    const total = list.length
    const { pageIndex = 1, pageSize = 15 } = req.query
    const data = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize).map((item) => {
      return { ...item, url: `//${req.host}:3000/images/${item.name}` }
    })
    const resp = {
      code: '0',
      msg: '查询成功',
      total,
      data,
    }
    res.send(resp)
  } catch (error) {
    const resp = {
      code: '0',
      msg: '查询成功',
      total,
      data,
    }
  }
}
