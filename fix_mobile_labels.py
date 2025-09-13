#!/usr/bin/env python3

with open('apps/web/app/register/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the mobile step labels section
old_section = '''            <span className={currentStep >= 4 ? 'text-tbat-primary font-medium' : 'text-gray-500'}>
              ยืนยัน
            </span>
            {formData.packageType === 'ADVANCED' && (
              <span className={currentStep >= 5 ? 'text-tbat-primary font-medium' : 'text-gray-500'}>
                ยืนยัน
              </span>
            )}'''

new_section = '''            <span className={currentStep >= 4 ? 'text-tbat-primary font-medium' : 'text-gray-500'}>
              ยืนยัน
            </span>
            <span className={currentStep >= 5 ? 'text-tbat-primary font-medium' : 'text-gray-500'}>
              Line
            </span>
            {formData.packageType === 'ADVANCED' && (
              <span className={currentStep >= 6 ? 'text-tbat-primary font-medium' : 'text-gray-500'}>
                ชำระ
              </span>
            )}'''

# Replace the section
new_content = content.replace(old_section, new_section)

# Write back to file
with open('apps/web/app/register/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Mobile step labels updated successfully!")