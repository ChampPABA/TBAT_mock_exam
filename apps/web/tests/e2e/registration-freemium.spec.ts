import { test, expect } from '@playwright/test'

test.describe('TBAT Registration - Freemium Model (Story 1.1)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display registration form without requiring BoxSet code', async ({ page }) => {
    // Should see the main registration form
    await expect(page.locator('h1')).toContainText('TBAT Mock Exam')
    await expect(page.locator('h2')).toContainText('ลงทะเบียนสอบ TBAT')
    
    // Should NOT see a required BoxSet code field by default
    await expect(page.locator('input[name="uniqueCode"]')).not.toBeVisible()
    
    // Should see new required fields
    await expect(page.locator('input[name="lineId"]')).toBeVisible()
    await expect(page.locator('label')).toContainText('Line ID *')
  })

  test('should complete FREE tier registration successfully', async ({ page }) => {
    // Fill out registration form for FREE tier
    await page.fill('input[name="email"]', 'free-e2e@example.com')
    await page.fill('input[name="name"]', 'Free E2E User')
    await page.fill('input[name="lineId"]', 'freeE2EUser2025')
    await page.selectOption('select[name="school"]', 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await page.selectOption('select[name="grade"]', 'M.5')
    
    // Select exactly 1 subject for FREE tier
    await page.check('input[type="checkbox"][value="Physics"]')
    
    // Fill password fields
    await page.fill('input[name="password"]', 'SecurePass123')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message with exam ticket
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible()
    await expect(page.locator('text=/TBAT-2025-[A-Z0-9]{4}/')).toBeVisible()
  })

  test('should show VVIP option when BoxSet code checkbox is selected', async ({ page }) => {
    // Check the BoxSet code checkbox
    await page.check('input[type="checkbox"]', { hasText: 'ฉันมีรหัสจาก Box Set' })
    
    // Should now show the BoxSet code input field
    await expect(page.locator('input[name="uniqueCode"]')).toBeVisible()
    await expect(page.locator('label')).toContainText('รหัสจาก Box Set')
  })

  test('should complete VVIP tier registration with BoxSet code', async ({ page }) => {
    // Enable BoxSet code option
    await page.check('input[type="checkbox"]', { hasText: 'ฉันมีรหัสจาก Box Set' })
    
    // Fill BoxSet code
    await page.fill('input[name="uniqueCode"]', 'TBAT-2345-6789')
    
    // Wait for code validation (might show loading indicator)
    await page.waitForTimeout(1000)
    
    // Fill out registration form
    await page.fill('input[name="email"]', 'vvip-e2e@example.com')
    await page.fill('input[name="name"]', 'VVIP E2E User')
    await page.fill('input[name="lineId"]', 'vvipE2EUser2025')
    await page.selectOption('select[name="school"]', 'โรงเรียนยุพราชวิทยาลัย')
    await page.selectOption('select[name="grade"]', 'M.6')
    
    // Select multiple subjects for VVIP tier
    await page.check('input[type="checkbox"][value="Physics"]')
    await page.check('input[type="checkbox"][value="Chemistry"]')
    await page.check('input[type="checkbox"][value="Biology"]')
    
    // Fill password fields
    await page.fill('input[name="password"]', 'SecurePass123')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible({ timeout: 10000 })
  })

  test('should prevent FREE tier from selecting multiple subjects', async ({ page }) => {
    // Fill basic info first
    await page.fill('input[name="email"]', 'multi-subject@example.com')
    await page.fill('input[name="name"]', 'Multi Subject User')
    await page.fill('input[name="lineId"]', 'multiSubjectUser')
    await page.selectOption('select[name="school"]', 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await page.selectOption('select[name="grade"]', 'M.5')
    
    // Try to select multiple subjects (should be restricted for FREE)
    await page.check('input[type="checkbox"][value="Physics"]')
    await page.check('input[type="checkbox"][value="Chemistry"]')
    
    // Should only have Physics selected (Chemistry should replace or be prevented)
    const physicsChecked = await page.isChecked('input[type="checkbox"][value="Physics"]')
    const chemistryChecked = await page.isChecked('input[type="checkbox"][value="Chemistry"]')
    
    // For FREE tier, only one should be selected
    expect(physicsChecked && chemistryChecked).toBeFalsy()
  })

  test('should show tier information correctly', async ({ page }) => {
    // Should show FREE tier information by default
    await expect(page.locator('.bg-yellow-50')).toBeVisible()
    await expect(page.locator('text=ระดับ FREE')).toBeVisible()
    await expect(page.locator('text=สอบได้ 1 วิชาเท่านั้น')).toBeVisible()
    
    // Enable BoxSet code
    await page.check('input[type="checkbox"]', { hasText: 'ฉันมีรหัสจาก Box Set' })
    
    // FREE tier info should still be visible (until valid code entered)
    await expect(page.locator('.bg-yellow-50')).toBeVisible()
  })

  test('should handle parent information correctly', async ({ page }) => {
    // Parent info should not be visible initially
    await expect(page.locator('input[name="parentName"]')).not.toBeVisible()
    
    // Enable parent information
    await page.check('input[type="checkbox"]', { hasText: 'เพิ่มข้อมูลผู้ปกครอง' })
    
    // Parent fields should now be visible
    await expect(page.locator('input[name="parentName"]')).toBeVisible()
    await expect(page.locator('select[name="parentRelation"]')).toBeVisible()
    await expect(page.locator('input[name="parentPhone"]')).toBeVisible()
    await expect(page.locator('input[name="parentEmail"]')).toBeVisible()
    
    // Fill parent information
    await page.fill('input[name="parentName"]', 'Test Parent')
    await page.selectOption('select[name="parentRelation"]', 'mother')
    await page.fill('input[name="parentPhone"]', '0812345678')
    await page.fill('input[name="parentEmail"]', 'parent@example.com')
    
    // Continue with registration...
    await page.fill('input[name="email"]', 'with-parent@example.com')
    await page.fill('input[name="name"]', 'Student With Parent')
    await page.fill('input[name="lineId"]', 'studentWithParent')
    await page.selectOption('select[name="school"]', 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await page.selectOption('select[name="grade"]', 'M.4')
    await page.check('input[type="checkbox"][value="Physics"]')
    await page.fill('input[name="password"]', 'SecurePass123')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123')
    
    await page.click('button[type="submit"]')
    
    // Should register successfully with parent info
    await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible({ timeout: 10000 })
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors (form should prevent submission)
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()
  })

  test('should validate Line ID requirement', async ({ page }) => {
    // Fill all fields except Line ID
    await page.fill('input[name="email"]', 'no-line@example.com')
    await page.fill('input[name="name"]', 'No Line User')
    // Skip lineId
    await page.selectOption('select[name="school"]', 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await page.selectOption('select[name="grade"]', 'M.5')
    await page.check('input[type="checkbox"][value="Physics"]')
    await page.fill('input[name="password"]', 'SecurePass123')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123')
    
    // Submit button should be disabled due to validation
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()
  })

  test('should show exam ticket format correctly', async ({ page }) => {
    // Complete a registration to get exam ticket
    await page.fill('input[name="email"]', 'ticket-test@example.com')
    await page.fill('input[name="name"]', 'Ticket Test User')
    await page.fill('input[name="lineId"]', 'ticketTestUser')
    await page.selectOption('select[name="school"]', 'โรงเรียนมัธยมศึกษาเชียงใหม่')
    await page.selectOption('select[name="grade"]', 'M.5')
    await page.check('input[type="checkbox"][value="Physics"]')
    await page.fill('input[name="password"]', 'SecurePass123')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123')
    
    await page.click('button[type="submit"]')
    
    // Check exam ticket format and display
    await expect(page.locator('text=ลงทะเบียนสำเร็จ')).toBeVisible({ timeout: 10000 })
    
    const ticketElement = page.locator('p.font-mono')
    await expect(ticketElement).toBeVisible()
    
    const ticketText = await ticketElement.textContent()
    expect(ticketText).toMatch(/รหัสสอบ: TBAT-2025-[A-Z0-9]{4}/)
    
    // Should show reminder message
    await expect(page.locator('text=กรุณาบันทึกรหัสนี้ไว้สำหรับการเข้าสอบ')).toBeVisible()
  })
})