'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStep: number
  totalSteps: number
  steps: {
    id: number
    title: string
    description?: string
    completed?: boolean
  }[]
  className?: string
}

export function ProgressStepper({
  currentStep,
  totalSteps,
  steps,
  className
}: StepperProps) {
  return (
    <div className={cn("w-full py-6", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative">
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 thai-text",
                {
                  // Completed step
                  "bg-tbat-primary border-tbat-primary text-white": 
                    step.completed || step.id < currentStep,
                  
                  // Current step
                  "border-tbat-primary bg-tbat-white text-tbat-primary ring-4 ring-tbat-primary/20": 
                    step.id === currentStep,
                  
                  // Future step
                  "border-tbat-surface bg-tbat-white text-muted-foreground": 
                    step.id > currentStep && !step.completed
                }
              )}
            >
              {step.completed || step.id < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>

            {/* Step Title */}
            <div className="mt-3 text-center max-w-24">
              <h3
                className={cn(
                  "text-sm font-medium thai-text leading-tight",
                  {
                    "text-tbat-primary": step.id === currentStep,
                    "text-gray-900": step.completed || step.id < currentStep,
                    "text-muted-foreground": step.id > currentStep && !step.completed
                  }
                )}
              >
                {step.title}
              </h3>
              {step.description && (
                <p
                  className={cn(
                    "text-xs mt-1 thai-text",
                    {
                      "text-tbat-primary/70": step.id === currentStep,
                      "text-gray-600": step.completed || step.id < currentStep,
                      "text-muted-foreground": step.id > currentStep && !step.completed
                    }
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 left-full w-full h-0.5 transform -translate-y-1/2",
                  {
                    "bg-tbat-primary": step.id < currentStep || step.completed,
                    "bg-tbat-surface": step.id >= currentStep && !step.completed
                  }
                )}
                style={{
                  width: `calc(100vw / ${steps.length} - 2.5rem)`
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar Alternative for Mobile */}
      <div className="mt-6 md:hidden">
        <div className="flex justify-between text-sm thai-text mb-2">
          <span className="text-muted-foreground">
            ขั้นตอนที่ {currentStep} จาก {totalSteps}
          </span>
          <span className="text-tbat-primary font-medium">
            {totalSteps === 0 ? 0 : Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-tbat-surface rounded-full h-2">
          <div
            className="bg-tbat-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalSteps === 0 ? 0 : (currentStep / totalSteps) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Mobile-friendly compact stepper
export function CompactProgressStepper({
  currentStep,
  totalSteps,
  className
}: {
  currentStep: number
  totalSteps: number
  className?: string
}) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex justify-between text-sm thai-text mb-2">
        <span className="text-muted-foreground font-medium">
          ขั้นตอนที่ {currentStep} จาก {totalSteps}
        </span>
        <span className="text-tbat-primary font-semibold">
          {totalSteps === 0 ? 0 : Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full bg-tbat-surface rounded-full h-3">
        <div
          className="bg-tbat-gradient h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${totalSteps === 0 ? 0 : Math.max((currentStep / totalSteps) * 100, 8)}%`
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              {
                "bg-tbat-primary": i + 1 <= currentStep,
                "bg-tbat-surface": i + 1 > currentStep
              }
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default ProgressStepper