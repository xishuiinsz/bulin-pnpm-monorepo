import Home from '@v/Home.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const pages = import.meta.glob('@p/**/page.js', {
  eager: true,
  import: 'default',
});
// 自动生成的菜单数据
export const menuList = [];
// 生成生成的路由数据
const routesPages = Object.values(pages).map((item) => {
  const { path, title, order, hasChild, component, icon = 'favor' } = item;
  let pathStr = path;
  if (path.includes('?')) {
    const index = path.indexOf('?');
    pathStr = path.slice(0, index);
  }
  const meta = { title, order, hasChild };
  menuList.push({
    icon,
    index: path,
    title,
  });
  return {
    path: pathStr,
    component,
    meta,
  };
});

function beforeEnterTp(to, _from) {
  if (to.params?.id === '2') {
    return true;
  }
  return { name: to.name, params: { id: 2 } };
}

const routes = [
  {
    path: '/',
    redirect: '/myComponents',
  },
  {
    path: '/myComponents',
    redirect: '/myComponents/dashboard',
    component: Home,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        meta: {
          title: '系统首页',
        },
        component: () => import(/* webpackChunkName: "dashboard" */ '@v/Dashboard.vue'),
      },
      {
        path: 'table',
        name: 'basetable',
        meta: {
          title: '表格',
        },
        component: () => import(/* webpackChunkName: "table" */ '@v/tableBaseData/entry.vue'),
      },
      {
        path: 'table/:id',
        name: 'detailTable',
        beforeEnter: beforeEnterTp,
        meta: {
          title: '表格',
        },
        component: () => import(/* webpackChunkName: "table" */ '@v/tableBaseData/detailsForm.vue'),
      },
      {
        path: 'customerTable',
        name: 'CustomerInfoTable',
        meta: {
          title: '客户表格',
        },
        component: () => import(/* webpackChunkName: "customerTable" */ '@v/CustomerTable/index.vue'),
      },

      {
        path: 'form',
        name: 'baseform',
        meta: {
          title: '结构化表单',
        },
        component: () => import(/* webpackChunkName: "form" */ '@v/formBaseData/entry.vue'),
      },
      {
        path: 'tabs',
        name: 'tabs',
        meta: {
          title: 'tab标签',
        },
        component: () => import(/* webpackChunkName: "tabs" */ '@v/Tabs.vue'),
      },
      {
        path: 'flowChartsByCavnvas',
        name: 'FlowChartsByCavnvas',
        meta: {
          title: 'html+canvas绘制流程图',
        },
        component: () => import(/* webpackChunkName: "flowChartsByCavnvas" */ '@/views/flowChartsByCavnvas/index.vue'),
      },
      {
        path: 'imgWaterfall',
        name: 'imgWaterfall',
        meta: {
          title: '图片瀑布流',
        },
        component: () => import(/* webpackChunkName: "imgWaterfall" */ '@/views/imgWaterfall/imgWaterfall.vue'),
      },
      {
        path: 'simpleTable',
        name: 'simpleTable',
        meta: {
          title: '简易表格',
        },
        component: () => import(/* webpackChunkName: "SimpleTable" */ '@/views/simple-table/entry.vue'),
      },
      {
        path: 'echartsAndVue',
        name: 'EchartsAndVue',
        meta: {
          title: 'echarts中Tip引入Vue组件',
        },
        component: () => import(/* webpackChunkName: "echartsAndVue" */ '@/views/EchartsAndVue/entry.vue'),
      },
      {
        path: 'chinaMap2D',
        name: 'ChinaMap2D',
        meta: {
          title: '2D中国地图',
        },
        component: () => import(/* webpackChunkName: "chinaMap2D" */ '@/views/echarts/chinaMap2D/index.vue'),
      },
      {
        path: 'chinaMap3D',
        name: 'ChinaMap3D',
        meta: {
          title: '3D中国地图',
        },
        component: () => import(/* webpackChunkName: "chinaMap2D" */ '@/views/echarts/chinaMap3D/index.vue'),
      },
      {
        path: 'tinymceDemo',
        name: 'TinymceDemo',
        meta: {
          title: 'tinymce富文本编辑器示例',
        },
        component: () => import(/* webpackChunkName: "tinymceDemo" */ '@/views/tinymceDemo/tinymceDemo.vue'),
      },
      {
        path: 'contenteditable',
        name: 'Contenteditable',
        meta: {
          title: '当html遇上contentEditable',
        },
        component: () => import(/* webpackChunkName: "contenteditable" */ '@/views/contenteditable/index.vue'),
      },
      {
        path: 'jsInvokeTooltip',
        name: 'JsInvokeTooltip',
        meta: {
          title: '当html遇上contentEditable',
        },
        component: () => import(/* webpackChunkName: "jsInvokeTooltip" */ '@/views/jsInvokeTooltip/index.vue'),
      },
      {
        path: 'scrollDriveAnimation',
        name: 'ScrollDriveAnimation',
        meta: {
          title: ' 检测容器内图片加载',
        },
        component: () => import(/* webpackChunkName: "scrollDriveAnimation" */ '@/views/scrollDriveAnimation/index.vue'),
      },
      {
        path: 'permission',
        name: 'permission',
        meta: {
          title: '权限管理',
          permission: true,
        },
        component: () => import(/* webpackChunkName: "permission" */ '@v/Permission.vue'),
      },
      {
        path: 'refreshRoute',
        name: 'refreshRoute',
        meta: {
          title: '刷新当前路由',
        },
        component: () => import(/* webpackChunkName: "refreshRoute" */ '@v/refreshRoute.vue'),
      },
      {
        path: 'i18n',
        name: 'i18n',
        meta: {
          title: '国际化语言',
        },
        component: () => import(/* webpackChunkName: "i18n" */ '@v/I18n.vue'),
      },
      {
        path: 'upload',
        name: 'upload',
        meta: {
          title: '上传插件',
        },
        component: () => import(/* webpackChunkName: "upload" */ '@v/Upload.vue'),
      },
      {
        path: 'icon',
        name: 'icon',
        meta: {
          title: '自定义图标',
        },
        component: () => import(/* webpackChunkName: "icon" */ '@v/Icon.vue'),
      },
      {
        path: '404',
        name: '404',
        meta: {
          title: '找不到页面',
        },
        component: () => import(/* webpackChunkName: "404" */ '@v/404.vue'),
      },
      {
        path: '403',
        name: '403',
        meta: {
          title: '没有权限',
        },
        component: () => import(/* webpackChunkName: "403" */ '@v/403.vue'),
      },
      {
        path: 'user',
        name: 'user',
        meta: {
          title: '个人中心',
        },
        component: () => import(/* webpackChunkName: "user" */ '@v/User.vue'),
      },
      {
        path: 'markdown',
        name: 'markdown',
        meta: {
          title: 'markdown编辑器',
        },
        component: () => import(/* webpackChunkName: "markdown" */ '@v/Markdown.vue'),
      },
      ...routesPages,
    ],
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
    },
    component: () => import(/* webpackChunkName: "login" */ '@v/Login.vue'),
  },

  {
    path: '/:pathMatch(.*)',
    name: 'NotFoundPage',
    mata: {
      title: '未匹配的路由',
    },
    component: () => import(/* webpackChunkName: "404" */ '@v/404.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | vue-manage-system`;
  const role = localStorage.getItem('ms_username');
  if (!role && to.path !== '/login') {
    next('/login');
  }
  else if (to.meta.permission) {
    // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
    role === 'admin' ? next() : next('/403');
  }
  else {
    next();
  }
});

export default router;
