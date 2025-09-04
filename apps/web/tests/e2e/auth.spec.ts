import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Modal', () => {
    test('should open login modal when clicking login button', async ({ page }) => {
      // Click login button
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Check modal is visible
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /เข้าสู่ระบบ/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Check validation messages
      await expect(page.getByText(/กรุณากรอกอีเมล/i)).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Enter invalid email
      await page.getByLabel(/อีเมล/i).fill('invalid-email');
      await page.getByLabel(/รหัสผ่าน/i).fill('password123');
      
      // Check validation message
      await expect(page.getByText(/รูปแบบอีเมลไม่ถูกต้อง/i)).toBeVisible();
    });

    test('should handle incorrect credentials with rate limiting', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Fill in incorrect credentials
      await page.getByLabel(/อีเมล/i).fill('wrong@email.com');
      await page.getByLabel(/รหัสผ่าน/i).fill('wrongpassword');
      
      // Submit form
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Check error message
      await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/i)).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Fill in valid credentials (from mock data)
      await page.getByLabel(/อีเมล/i).fill('student@tbat.ac.th');
      await page.getByLabel(/รหัสผ่าน/i).fill('tbat2024!');
      
      // Submit form
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      
      // Check we're on dashboard
      expect(page.url()).toContain('/dashboard');
    });

    test('should toggle password visibility', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Enter password
      const passwordInput = page.getByLabel(/รหัสผ่าน/i);
      await passwordInput.fill('mypassword');
      
      // Check initial type is password
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button
      await page.getByLabel(/แสดงรหัสผ่าน/i).click();
      
      // Check type changed to text
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle again
      await page.getByLabel(/ซ่อนรหัสผ่าน/i).click();
      
      // Check type changed back to password
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should close modal with ESC key', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Check modal is visible
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Press ESC
      await page.keyboard.press('Escape');
      
      // Check modal is closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should switch to BoxSet Code modal', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Click switch to BoxSet Code
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).click();
      
      // Check BoxSet modal is open
      await expect(page.getByRole('heading', { name: /กรอก BoxSet Code/i })).toBeVisible();
    });
  });

  test.describe('BoxSet Code Modal', () => {
    test('should open BoxSet Code modal when clicking register button', async ({ page }) => {
      // Click BoxSet Code button
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Check modal is visible
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /กรอก BoxSet Code/i })).toBeVisible();
    });

    test('should format BoxSet code input automatically', async ({ page }) => {
      // Open BoxSet modal
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Type code without dashes
      const codeInput = page.getByPlaceholder(/TBAT-XXXX-XXXX/i);
      await codeInput.fill('TBAT12345678');
      
      // Check formatted value
      await expect(codeInput).toHaveValue('TBAT-1234-5678');
    });

    test('should validate BoxSet code format', async ({ page }) => {
      // Open BoxSet modal
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Enter invalid format
      const codeInput = page.getByPlaceholder(/TBAT-XXXX-XXXX/i);
      await codeInput.fill('INVALID');
      
      // Try to submit
      await page.getByRole('button', { name: /ยืนยันรหัส/i }).click();
      
      // Check error message
      await expect(page.getByText(/รูปแบบรหัสไม่ถูกต้อง/i)).toBeVisible();
    });

    test('should handle invalid BoxSet code', async ({ page }) => {
      // Open BoxSet modal
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Enter invalid code
      const codeInput = page.getByPlaceholder(/TBAT-XXXX-XXXX/i);
      await codeInput.fill('TBAT-9999-9999');
      
      // Submit
      await page.getByRole('button', { name: /ยืนยันรหัส/i }).click();
      
      // Check error message
      await expect(page.getByText(/รหัส BoxSet ไม่ถูกต้อง/i)).toBeVisible();
    });

    test('should successfully validate correct BoxSet code', async ({ page }) => {
      // Open BoxSet modal
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Enter valid code (from mock data)
      const codeInput = page.getByPlaceholder(/TBAT-XXXX-XXXX/i);
      await codeInput.fill('TBAT-DEMO-1234');
      
      // Submit
      await page.getByRole('button', { name: /ยืนยันรหัส/i }).click();
      
      // Check success message
      await expect(page.getByText(/ยืนยันรหัสสำเร็จ/i)).toBeVisible();
      
      // Wait for navigation to registration
      await page.waitForURL('**/register?code=TBAT-DEMO-1234', { timeout: 5000 });
      
      // Check we're on registration page with code
      expect(page.url()).toContain('/register');
      expect(page.url()).toContain('code=TBAT-DEMO-1234');
    });

    test('should disable submit button when code is incomplete', async ({ page }) => {
      // Open BoxSet modal
      await page.getByRole('button', { name: /กรอก BoxSet Code/i }).first().click();
      
      // Check button is disabled initially
      const submitButton = page.getByRole('button', { name: /ยืนยันรหัส/i });
      await expect(submitButton).toBeDisabled();
      
      // Enter partial code
      const codeInput = page.getByPlaceholder(/TBAT-XXXX-XXXX/i);
      await codeInput.fill('TBAT-1234');
      
      // Check button is still disabled
      await expect(submitButton).toBeDisabled();
      
      // Complete the code
      await codeInput.fill('TBAT-1234-5678');
      
      // Check button is enabled
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Rate Limiting', () => {
    test('should enforce rate limiting after multiple failed attempts', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Attempt login multiple times with wrong credentials
      for (let i = 0; i < 6; i++) {
        await page.getByLabel(/อีเมล/i).fill(`test${i}@email.com`);
        await page.getByLabel(/รหัสผ่าน/i).fill('wrongpassword');
        await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
        
        // Wait a bit between attempts
        await page.waitForTimeout(100);
        
        // Clear the form for next attempt
        if (i < 5) {
          await page.getByLabel(/อีเมล/i).clear();
          await page.getByLabel(/รหัสผ่าน/i).clear();
        }
      }
      
      // Check rate limit message appears
      await expect(page.getByText(/การเข้าสู่ระบบถูกจำกัด/i)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page, context }) => {
      // Block API requests to simulate network error
      await context.route('**/api/auth/login', route => route.abort());
      
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Try to login
      await page.getByLabel(/อีเมล/i).fill('test@email.com');
      await page.getByLabel(/รหัสผ่าน/i).fill('password123');
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Check error message
      await expect(page.getByText(/เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์/i)).toBeVisible();
    });

    test('should show loading state during authentication', async ({ page }) => {
      // Slow down the API response
      await page.route('**/api/auth/login', async route => {
        await page.waitForTimeout(1000);
        await route.continue();
      });
      
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Fill form
      await page.getByLabel(/อีเมล/i).fill('student@tbat.ac.th');
      await page.getByLabel(/รหัสผ่าน/i).fill('tbat2024!');
      
      // Submit
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Check loading state
      await expect(page.getByText(/กำลังเข้าสู่ระบบ/i)).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should work on mobile devices', async ({ page }) => {
      // Open mobile menu
      await page.getByRole('button', { name: /menu/i }).click();
      
      // Click login button in mobile menu
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).click();
      
      // Check modal is visible and functional
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Fill form
      await page.getByLabel(/อีเมล/i).fill('student@tbat.ac.th');
      await page.getByLabel(/รหัสผ่าน/i).fill('tbat2024!');
      
      // Submit
      await page.getByRole('button', { name: /^เข้าสู่ระบบ$/i }).click();
      
      // Wait for navigation
      await page.waitForURL('**/dashboard', { timeout: 5000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Tab through form fields
      await page.keyboard.press('Tab'); // Focus email
      await page.keyboard.type('student@tbat.ac.th');
      
      await page.keyboard.press('Tab'); // Focus password
      await page.keyboard.type('tbat2024!');
      
      await page.keyboard.press('Tab'); // Focus show password button
      await page.keyboard.press('Tab'); // Focus forgot password link
      await page.keyboard.press('Tab'); // Focus submit button
      
      // Submit with Enter
      await page.keyboard.press('Enter');
      
      // Wait for navigation
      await page.waitForURL('**/dashboard', { timeout: 5000 });
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Open login modal
      await page.getByRole('button', { name: /เข้าสู่ระบบ/i }).first().click();
      
      // Check dialog role
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      
      // Check form inputs have labels
      await expect(page.getByLabel(/อีเมล/i)).toBeVisible();
      await expect(page.getByLabel(/รหัสผ่าน/i)).toBeVisible();
      
      // Check buttons have accessible names
      await expect(page.getByRole('button', { name: /^เข้าสู่ระบบ$/i })).toBeVisible();
    });
  });
});