import { expect, test, type Page } from '@playwright/test'

const BASE_URL = 'http://localhost.bulin.com:8080'
const CUSTOMER_API = `${BASE_URL}/api/customerInfo`

/** 客户数据行（后端返回的驼峰字段） */
interface CustomerRow {
  customerId: number
  firstName: string
  lastName: string
  company?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  email?: string
  [key: string]: unknown
}

interface CustomerListResp {
  list: CustomerRow[]
  pageTotal: number
}

/** 直连后端接口取数据，作为页面展示结果的对照基线 */
async function fetchCustomerList(page: Page, payload: Record<string, unknown>): Promise<CustomerListResp> {
  const resp = await page.request.post(CUSTOMER_API, { data: payload })
  expect(resp.ok(), `接口[${CUSTOMER_API}]应正常返回`).toBeTruthy()
  return resp.json()
}

/** 登录并跳转到客户表格页 */
async function gotoCustomerTable(page: Page) {
  await page.goto(`${BASE_URL}/#/login`)
  const loginBtn = page.getByRole('button', { name: '登录' })
  await expect(loginBtn).toBeVisible()
  await loginBtn.click()
  // 登录成功后跳转到首页（/#/myComponents/dashboard）
  await page.waitForURL(/#\/myComponents/)
  await page.goto(`${BASE_URL}/#/myComponents/customerTable`)
}

/** 断言分页组件上的总数数字（文案形如：共 59 条） */
async function expectTotal(page: Page, expected: number) {
  await expect
    .poll(async () => {
      const totalText = await page.locator('.el-pagination__total').innerText()
      return Number(totalText.replace(/\D/g, ''))
    })
    .toBe(expected)
}

/** 转义正则特殊字符 */
function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 点击指定表头列（0 起索引）的筛选图标，打开筛选 popover */
async function openHeaderFilter(page: Page, columnIndex: number) {
  const th = page.locator('.el-table__header th').nth(columnIndex)
  await th.locator('.el-icon').click()
  // el-popover 内容挂载在 body 下，同一时刻只有一个可见
  const popover = page.locator('.el-popover').filter({ visible: true })
  await expect(popover).toBeVisible()
  return { th, popover }
}

test.describe('客户表格页交互验证', () => {
  test('查询：按地址搜索后表格正确过滤，重置后恢复', async ({ page }) => {
    await gotoCustomerTable(page)

    // 基线数据：与页面初始查询参数一致（pageIndex=1、pageSize=10、无过滤条件）
    const baseline = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: '',
      countryList: [],
    })
    expect(baseline.list.length, '基线数据不应为空').toBeGreaterThan(0)

    const bodyRows = page.locator('.el-table__body tbody tr')
    await expect(bodyRows).toHaveCount(baseline.list.length)
    await expectTotal(page, baseline.pageTotal)
    // 首行客户代表（第 2 列）应与基线首条数据一致
    const first = baseline.list[0]
    await expect(bodyRows.first().locator('td').nth(1)).toContainText(`${first.firstName} ${first.lastName}`)

    // 以基线首行的完整地址作为关键词进行搜索
    const keyword = String(first.address ?? '')
    expect(keyword, '基线首行地址不应为空').not.toBe('')
    const addressInput = page.getByPlaceholder('请输入地址')
    await addressInput.fill(keyword)

    const handleBox = page.locator('.handle-box')
    const [searchResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      handleBox.getByRole('button', { name: '搜索' }).click(),
    ])
    const searched = (await searchResp.json()) as CustomerListResp
    expect(searched.list.length, '搜索应至少命中一条记录').toBeGreaterThan(0)

    // 表格行数、分页总数与本次搜索响应一致
    await expect(bodyRows).toHaveCount(searched.list.length)
    await expectTotal(page, searched.pageTotal)

    // 与直连接口的结果交叉验证
    const expected = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: keyword,
      name: '',
      countryList: [],
    })
    expect(searched.pageTotal).toBe(expected.pageTotal)
    expect(searched.list.map((item) => item.customerId)).toEqual(
      expected.list.map((item) => item.customerId),
    )

    // 每一行的客户地址（第 4 列）都应包含关键词（后端为不区分大小写的模糊匹配）
    const lowerKeyword = keyword.toLowerCase()
    const addressCells = bodyRows.locator('td:nth-child(4)')
    await expect(addressCells).toHaveCount(searched.list.length)
    for (let i = 0; i < searched.list.length; i++) {
      const text = (await addressCells.nth(i).innerText()).toLowerCase()
      expect(text, `第 ${i + 1} 行客户地址应包含搜索关键词`).toContain(lowerKeyword)
    }

    // 重置后表格恢复为初始状态
    const [resetResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      handleBox.getByRole('button', { name: '重置' }).click(),
    ])
    const resetData = (await resetResp.json()) as CustomerListResp
    await expect(bodyRows).toHaveCount(resetData.list.length)
    await expectTotal(page, resetData.pageTotal)
    await expect(addressInput).toHaveValue('')
  })

  test('编辑：弹窗打开且表单回填正确，取消关闭且不发送更新请求', async ({ page }) => {
    await gotoCustomerTable(page)

    const baseline = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: '',
      countryList: [],
    })
    expect(baseline.list.length, '基线数据不应为空').toBeGreaterThan(0)
    const first = baseline.list[0]

    // 记录所有更新请求，用于断言本次流程不写库
    const putRequests: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/api/customerInfo')) {
        putRequests.push(req.url())
      }
    })

    // 点击第一行的编辑按钮
    const firstRow = page.locator('.el-table__body tbody tr').first()
    await firstRow.getByRole('button', { name: '编辑' }).click()

    // 编辑弹窗出现（showDialog 挂载在 .new-app-for-dialog 容器内）
    const dialog = page.locator('.new-app-for-dialog .el-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.el-dialog__title')).toHaveText('编辑')

    // 表单按行数据回填
    const editForm = dialog.locator('.edit-customer-form')
    await expect(editForm).toBeVisible()
    await expect(editForm.getByLabel('用户名')).toHaveValue(`${first.firstName} ${first.lastName}`)
    await expect(editForm.getByLabel('客户公司名')).toHaveValue(first.company ?? '')
    await expect(editForm.getByLabel('客户地址')).toHaveValue(first.address ?? '')
    await expect(editForm.getByLabel('城市')).toHaveValue(first.city ?? '')
    await expect(editForm.getByLabel('省|州')).toHaveValue(first.state ?? '')
    await expect(editForm.getByLabel('国家')).toHaveValue(first.country ?? '')
    await expect(editForm.getByLabel('邮件')).toHaveValue(first.email ?? '')

    // 通过取消关闭弹窗（不点击“确 定”，不提交）
    await editForm.getByRole('button', { name: '取 消' }).click()
    await expect(dialog).toBeHidden()

    // 全程未发出任何更新请求（未写库）
    expect(putRequests, '取消操作不应发送任何更新请求').toHaveLength(0)
  })

  test('客户代表表头筛选：按姓名过滤后表格正确更新，清空后恢复', async ({ page }) => {
    await gotoCustomerTable(page)

    const baseline = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: '',
      countryList: [],
    })
    expect(baseline.list.length, '基线数据不应为空').toBeGreaterThan(0)

    // 以基线首行的名字作为筛选关键词
    const keyword = String(baseline.list[0].firstName ?? '')
    expect(keyword, '基线首行名字不应为空').not.toBe('')

    const bodyRows = page.locator('.el-table__body tbody tr')
    // 客户代表列为第 2 列（索引 1）
    const { th, popover } = await openHeaderFilter(page, 1)

    await popover.getByPlaceholder('请输入内容').fill(keyword)
    const [searchResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      popover.getByRole('button', { name: '确定' }).click(),
    ])
    const searched = (await searchResp.json()) as CustomerListResp
    expect(searched.list.length, '表头筛选应至少命中一条记录').toBeGreaterThan(0)

    // 表格行数、总数与本次筛选响应一致
    await expect(bodyRows).toHaveCount(searched.list.length)
    await expectTotal(page, searched.pageTotal)
    // 与直连接口的结果交叉验证
    const expected = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: keyword,
      countryList: [],
    })
    expect(searched.pageTotal).toBe(expected.pageTotal)
    expect(searched.list.map((item) => item.customerId)).toEqual(
      expected.list.map((item) => item.customerId),
    )

    // 每一行的客户代表（第 2 列）都应包含关键词（后端为不区分大小写的模糊匹配）
    const lowerKeyword = keyword.toLowerCase()
    const nameCells = bodyRows.locator('td:nth-child(2)')
    await expect(nameCells).toHaveCount(searched.list.length)
    for (let i = 0; i < searched.list.length; i++) {
      const text = (await nameCells.nth(i).innerText()).toLowerCase()
      expect(text, `第 ${i + 1} 行客户代表应包含筛选关键词`).toContain(lowerKeyword)
    }

    // 筛选生效后：筛选图标高亮，popover 关闭
    await expect(th.locator('.el-icon')).toHaveClass(/color-3a85ff/)
    await expect(popover).toBeHidden()

    // 通过“清空”恢复
    const { popover: resetPopover } = await openHeaderFilter(page, 1)
    const [resetResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      resetPopover.getByRole('button', { name: '清空' }).click(),
    ])
    const resetData = (await resetResp.json()) as CustomerListResp
    await expect(bodyRows).toHaveCount(resetData.list.length)
    await expectTotal(page, resetData.pageTotal)
    await expect(th.locator('.el-icon')).not.toHaveClass(/color-3a85ff/)
  })

  test('国家表头筛选：多选国家过滤后表格正确更新，清空后恢复', async ({ page }) => {
    await gotoCustomerTable(page)

    const baseline = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: '',
      countryList: [],
    })
    expect(baseline.list.length, '基线数据不应为空').toBeGreaterThan(0)

    // 从基线行中取至多 2 个不同国家作为筛选目标
    const countries = [
      ...new Set(baseline.list.map((row) => String(row.country ?? '').trim()).filter(Boolean)),
    ].slice(0, 2)
    expect(countries.length, '基线数据应至少包含一个国家').toBeGreaterThan(0)

    const bodyRows = page.locator('.el-table__body tbody tr')
    // 国家列为第 7 列（索引 6）
    const { th, popover } = await openHeaderFilter(page, 6)

    // 等待国家选项加载完成，勾选目标国家
    for (const country of countries) {
      const checkbox = popover
        .locator('.el-checkbox')
        .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(country)}\\s*$`) })
      await expect(checkbox, `国家选项[${country}]应存在`).toBeVisible()
      await checkbox.click()
    }

    const [searchResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      popover.getByRole('button', { name: '确定' }).click(),
    ])
    const searched = (await searchResp.json()) as CustomerListResp
    expect(searched.list.length, '国家筛选应至少命中一条记录').toBeGreaterThan(0)

    // 表格行数、总数与本次筛选响应一致
    await expect(bodyRows).toHaveCount(searched.list.length)
    await expectTotal(page, searched.pageTotal)
    // 与直连接口的结果交叉验证
    const expected = await fetchCustomerList(page, {
      pageIndex: 1,
      pageSize: 10,
      address: '',
      name: '',
      countryList: countries,
    })
    expect(searched.pageTotal).toBe(expected.pageTotal)
    expect(searched.list.map((item) => item.customerId)).toEqual(
      expected.list.map((item) => item.customerId),
    )

    // 每一行的国家（第 7 列）都应在所选集合内（后端为不区分大小写匹配）
    const selectedSet = new Set(countries.map((country) => country.toLowerCase()))
    const countryCells = bodyRows.locator('td:nth-child(7)')
    await expect(countryCells).toHaveCount(searched.list.length)
    for (let i = 0; i < searched.list.length; i++) {
      const text = (await countryCells.nth(i).innerText()).trim().toLowerCase()
      expect(selectedSet.has(text), `第 ${i + 1} 行国家应在筛选集合内`).toBeTruthy()
    }

    // 筛选生效后：筛选图标高亮，popover 关闭
    await expect(th.locator('.el-icon')).toHaveClass(/color-3a85ff/)
    await expect(popover).toBeHidden()

    // 通过“清空”恢复
    const { popover: resetPopover } = await openHeaderFilter(page, 6)
    const [resetResp] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/customerInfo') && resp.request().method() === 'POST'),
      resetPopover.getByRole('button', { name: '清空' }).click(),
    ])
    const resetData = (await resetResp.json()) as CustomerListResp
    await expect(bodyRows).toHaveCount(resetData.list.length)
    await expectTotal(page, resetData.pageTotal)
    await expect(th.locator('.el-icon')).not.toHaveClass(/color-3a85ff/)
  })
})
