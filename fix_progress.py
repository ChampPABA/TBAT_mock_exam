#!/usr/bin/env python3

with open('apps/web/app/register/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the progress bar section
old_section = '''            {/* Connector 4 (Only for Advanced) */}
            {formData.packageType === 'ADVANCED' && (
              <>
                <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
                  currentStep >= 5 ? 'bg-tbat-primary' : 'bg-gray-300'
                }`}>
                </div>

                {/* Step 5 */}
                <div className="flex items-center animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center font-semibold transform transition-transform ${
                    currentStep >= 5 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
                  } ${currentStep === 5 ? 'scale-110' : ''}`}>
                    <span>5</span>
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium hidden lg:block ${
                    currentStep >= 5 ? 'text-tbat-primary' : 'text-gray-500'
                  }`}>
                    ยืนยัน
                  </span>
                </div>
              </>
            )}'''

new_section = '''            {/* Connector 4 */}
            <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
              currentStep >= 5 ? 'bg-tbat-primary' : 'bg-gray-300'
            }`}>
            </div>

            {/* Step 5 - QR Code Line */}
            <div className="flex items-center animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center font-semibold transform transition-transform ${
                currentStep >= 5 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
              } ${currentStep === 5 ? 'scale-110' : ''}`}>
                <span>5</span>
              </div>
              <span className={`ml-2 text-xs sm:text-sm font-medium hidden lg:block ${
                currentStep >= 5 ? 'text-tbat-primary' : 'text-gray-500'
              }`}>
                เข้าร่วม Line
              </span>
            </div>

            {/* Connector 5 (Only for Advanced) */}
            {formData.packageType === 'ADVANCED' && (
              <>
                <div className={`flex-1 h-1 mx-1 sm:mx-2 ${
                  currentStep >= 6 ? 'bg-tbat-primary' : 'bg-gray-300'
                }`}>
                </div>

                {/* Step 6 - Payment for Advanced */}
                <div className="flex items-center animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center font-semibold transform transition-transform ${
                    currentStep >= 6 ? 'bg-tbat-primary text-white' : 'bg-gray-300 text-gray-500'
                  } ${currentStep === 6 ? 'scale-110' : ''}`}>
                    <span>6</span>
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium hidden lg:block ${
                    currentStep >= 6 ? 'text-tbat-primary' : 'text-gray-500'
                  }`}>
                    ชำระเงิน
                  </span>
                </div>
              </>
            )}'''

# Replace the section
new_content = content.replace(old_section, new_section)

# Write back to file
with open('apps/web/app/register/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Progress bar section updated successfully!")