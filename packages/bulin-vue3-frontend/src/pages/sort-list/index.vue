<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pageData, { rootClass } from './page';
import SortList from './SortList.vue';

interface SortListItem {
  id: number
  text: string
  children?: SortListItem[]
}

// mock 中国省市区三级数据：5 个省，每个省 5 个市，每个市 5 个区
const regionData: Record<string, Record<string, string[]>> = {
  广东省: {
    广州市: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区'],
    深圳市: ['福田区', '南山区', '罗湖区', '宝安区', '龙岗区'],
    佛山市: ['禅城区', '南海区', '顺德区', '三水区', '高明区'],
    汕头市: ['龙湖区', '金平区', '濠江区', '潮阳区', '澄海区'],
    惠州市: ['惠城区', '惠阳区', '博罗县', '惠东县', '龙门县'],
  },
  浙江省: {
    杭州市: ['上城区', '拱墅区', '西湖区', '滨江区', '余杭区'],
    宁波市: ['海曙区', '江北区', '镇海区', '北仑区', '鄞州区'],
    温州市: ['鹿城区', '龙湾区', '瓯海区', '洞头区', '永嘉县'],
    嘉兴市: ['南湖区', '秀洲区', '嘉善县', '海盐县', '桐乡市'],
    绍兴市: ['越城区', '柯桥区', '上虞区', '诸暨市', '嵊州市'],
  },
  江苏省: {
    南京市: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区'],
    苏州市: ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区'],
    无锡市: ['锡山区', '惠山区', '滨湖区', '梁溪区', '新吴区'],
    常州市: ['天宁区', '钟楼区', '新北区', '武进区', '金坛区'],
    南通市: ['崇川区', '通州区', '海门区', '如皋市', '启东市'],
  },
  四川省: {
    成都市: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区'],
    绵阳市: ['涪城区', '游仙区', '安州区', '江油市', '三台县'],
    德阳市: ['旌阳区', '罗江区', '广汉市', '什邡市', '绵竹市'],
    宜宾市: ['翠屏区', '南溪区', '叙州区', '江安县', '长宁县'],
    南充市: ['顺庆区', '高坪区', '嘉陵区', '阆中市', '南部县'],
  },
  山东省: {
    济南市: ['历下区', '市中区', '槐荫区', '天桥区', '历城区'],
    青岛市: ['市南区', '市北区', '黄岛区', '崂山区', '李沧区'],
    烟台市: ['芝罘区', '福山区', '牟平区', '莱山区', '蓬莱区'],
    潍坊市: ['潍城区', '寒亭区', '坊子区', '奎文区', '寿光市'],
    淄博市: ['张店区', '淄川区', '博山区', '临淄区', '周村区'],
  },
}

// 自增 id 生成器，保证每个节点的 id 唯一
let nextId = 1
const data: SortListItem[] = Object.entries(regionData).map(([province, cities]) => ({
  id: nextId++,
  text: province,
  children: Object.entries(cities).map(([city, districts]) => ({
    id: nextId++,
    text: city,
    children: districts.map((district) => ({ id: nextId++, text: district })),
  })),
}))
</script>

<template>
  <div :class="rootClass" class="w-100 h-100 d-flex flex-column">
    <div class="crumbs">
      <div class="el-breadcrumb" aria-label="Breadcrumb" role="navigation">
        <span class="el-breadcrumb__item" aria-current="page" />
        <span class="el-breadcrumb__inner" role="link">
          <i class="el-icon-lx-warn" />
          {{ pageData.title }}
        </span>
      </div>
    </div>
    <div class="container w-100 h-100 flex-fill">
      <SortList :list="data" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auto-generate-page {}
</style>
