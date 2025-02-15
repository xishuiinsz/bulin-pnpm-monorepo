import { expect, test } from '@playwright/test'

test('loads mock data', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.login-btn')).toHaveText('登录')
  await page.getByPlaceholder('username').fill('bulin')
  await page.getByPlaceholder('password').fill('123')
  await page.getByRole('button', { name: '登录' }).click()
})
