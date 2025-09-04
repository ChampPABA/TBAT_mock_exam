/**
 * End-to-End tests for VVIP Payment Flow
 * Tests the complete user journey from registration to payment
 */

import { test, expect } from '@playwright/test'

// Use test Stripe keys for E2E tests
const TEST_STRIPE_CARD = '4242424242424242'
const TEST_CARD_CVC = '123'
const TEST_CARD_EXPIRY = '12/30'

test.describe('VVIP Payment Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/registration')
  })

  test('should complete VVIP registration with payment', async ({ page }) => {
    // Step 1: Select VVIP with Payment tier
    await page.getByLabel('VVIP - ชำระเงิน ฿690').click()
    
    // Verify payment info box appears
    await expect(page.getByText('จะนำไปสู่หน้าชำระเงินที่ปลอดภัยผ่าน Stripe')).toBeVisible()

    // Step 2: Fill registration form
    await page.getByLabel('อีเมล').fill('test@example.com')
    await page.getByLabel('ชื่อ-นามสกุล').fill('ทดสอบ นักเรียน')
    await page.getByLabel('โรงเรียน').selectOption('โรงเรียนสาธิต')
    await page.getByLabel('ชั้นเรียน').selectOption('M.6')
    await page.getByLabel('Line ID').fill('test_line_id')
    await page.getByLabel('รหัสผ่าน').fill('TestPassword123')
    await page.getByLabel('ยืนยันรหัสผ่าน').fill('TestPassword123')

    // Verify all 3 subjects are auto-selected for VVIP
    await expect(page.getByText('Physics')).toBeChecked()
    await expect(page.getByText('Chemistry')).toBeChecked()
    await expect(page.getByText('Biology')).toBeChecked()

    // Step 3: Submit registration and trigger payment
    await page.getByRole('button', { name: 'ชำระเงิน ฿690 ผ่าน Stripe' }).click()

    // Step 4: Wait for Stripe Checkout redirect
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })

    // Verify we're on Stripe Checkout
    await expect(page).toHaveURL(/checkout\.stripe\.com/)
    
    // Step 5: Fill Stripe payment form (test mode)
    // Note: Stripe Checkout has specific selectors
    await page.frameLocator('iframe[name="stripe_checkout_app"]').locator('[placeholder="Card number"]').fill(TEST_STRIPE_CARD)
    await page.frameLocator('iframe[name="stripe_checkout_app"]').locator('[placeholder="MM / YY"]').fill(TEST_CARD_EXPIRY)
    await page.frameLocator('iframe[name="stripe_checkout_app"]').locator('[placeholder="CVC"]').fill(TEST_CARD_CVC)
    
    // Step 6: Complete payment
    await page.frameLocator('iframe[name="stripe_checkout_app"]').getByRole('button', { name: /Pay.*690/ }).click()

    // Step 7: Wait for redirect to success page
    await page.waitForURL('/registration/success', { timeout: 15000 })

    // Step 8: Verify success page
    await expect(page.getByText('ชำระเงินสำเร็จ!')).toBeVisible()
    await expect(page.getByText('ยินดีต้อนรับสู่ระดับ VVIP')).toBeVisible()
    
    // Verify VVIP benefits are displayed
    await expect(page.getByText('สอบได้ทั้ง 3 วิชา')).toBeVisible()
    await expect(page.getByText('รายงานวิเคราะห์ผลอย่างละเอียด')).toBeVisible()
  })

  test('should handle payment cancellation', async ({ page }) => {
    // Step 1: Select VVIP with Payment
    await page.getByLabel('VVIP - ชำระเงิน ฿690').click()
    
    // Step 2: Fill minimal form
    await page.getByLabel('อีเมล').fill('cancel@example.com')
    await page.getByLabel('ชื่อ-นามสกุล').fill('ยกเลิก ทดสอบ')
    
    // Step 3: Trigger payment
    await page.getByRole('button', { name: 'ชำระเงิน ฿690 ผ่าน Stripe' }).click()

    // Step 4: Wait for Stripe Checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })

    // Step 5: Click cancel/back button on Stripe
    await page.frameLocator('iframe[name="stripe_checkout_app"]').getByRole('button', { name: /Back|Cancel/ }).click()

    // Step 6: Verify redirect to cancel page
    await page.waitForURL('/registration/cancel', { timeout: 10000 })
    
    // Step 7: Verify cancel page content
    await expect(page.getByText('ยกเลิกการชำระเงิน')).toBeVisible()
    await expect(page.getByRole('button', { name: 'กลับไปลงทะเบียน' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'ลองชำระเงินอีกครั้ง' })).toBeVisible()
  })

  test('should display VVIP status in dashboard after payment', async ({ page }) => {
    // Simulate successful payment by mocking user session
    // In real test, would complete actual payment flow
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Login if needed
    if (page.url().includes('/login')) {
      await page.getByLabel('อีเมล').fill('vvip@example.com')
      await page.getByLabel('รหัสผ่าน').fill('TestPassword123')
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
    }

    // Verify VVIP badge is displayed
    await expect(page.getByText('VVIP Member')).toBeVisible()
    
    // Verify tier information shows VVIP
    await expect(page.getByText('ระดับสมาชิก').locator('..').getByText('VVIP')).toBeVisible()
  })

  test('should enforce rate limiting on payment endpoints', async ({ page }) => {
    // Make multiple rapid payment requests
    const requests = []
    
    for (let i = 0; i < 6; i++) {
      requests.push(
        page.evaluate(() => {
          return fetch('/api/payment/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ upgradeType: 'PRE_EXAM' })
          })
        })
      )
    }

    const responses = await Promise.all(requests)
    
    // First 5 should succeed (or return normal errors)
    for (let i = 0; i < 5; i++) {
      expect(responses[i].status).not.toBe(429)
    }
    
    // 6th request should be rate limited
    expect(responses[5].status).toBe(429)
    
    const rateLimitError = await responses[5].json()
    expect(rateLimitError.error).toBe('RATE_LIMITED')
  })
})

test.describe('Payment Status Verification', () => {
  test('should check payment status after successful payment', async ({ page }) => {
    // Simulate a session ID (in real test, get from successful payment)
    const sessionId = 'cs_test_success_123'
    
    // Make API call to check status
    const response = await page.request.get(`/api/payment/status/${sessionId}`)
    
    expect(response.status()).toBe(200)
    
    const status = await response.json()
    expect(status).toMatchObject({
      status: expect.stringMatching(/complete|processing|pending|expired/),
      paid: expect.any(Boolean),
      userUpgraded: expect.any(Boolean)
    })
  })

  test('should handle invalid session ID gracefully', async ({ page }) => {
    const response = await page.request.get('/api/payment/status/invalid_session_id')
    
    expect(response.status()).toBe(404)
    
    const error = await response.json()
    expect(error.error).toBe('INVALID_SESSION')
  })
})