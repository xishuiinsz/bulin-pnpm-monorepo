//导包
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const { logGreen } = require('./utils')
//创建app
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }
  })
)
// parse application/json
app.use(bodyParser.json())

// Use the session middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
  })
)

//设置静态资源根目录
app.use(express.static(path.join(__dirname, 'public')))

const registerRoute = require(path.join(__dirname, 'routers/index.js'))
registerRoute(app)

//启动
const port = 3000
const server = 'localhost.bulin.com'
app.listen(port, server, (err) => {
  if (err) {
    console.error(err)
  }

  logGreen(`server [${server}] is starting successfully on port:${port}`)
})
