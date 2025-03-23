import { expect, Locator, test } from '@playwright/test'

test('edit customer table', async ({ page }) => {
  await page.goto('http://localhost.bulin.com:8080/#/login')
  const loginBtn = page.getByRole('button', { name: '登录' })
  await expect(loginBtn).toBeVisible()
  await loginBtn.click()
  await page.waitForTimeout(2000)
  await page.goto('http://localhost.bulin.com:8080/#/myComponents/customerTable')
  const btnList = page.getByRole('button', { name: '编辑' })
  const editBtn = btnList.first()
  await expect(editBtn).toBeVisible()
  await editBtn.click()
  const editForm = page.locator('.test-1742734748921')
  const input = editForm.getByLabel('用户名')
  await input.fill('bulin zhang')
  const submitBtn = editForm.getByRole('button', { name: '确 定' })
  await submitBtn.click()
})
