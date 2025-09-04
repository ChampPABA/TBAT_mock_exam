'use client'

import React, { forwardRef } from 'react'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { cn } from '@/lib/utils'

interface ThaiFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
  description?: string
  icon?: React.ReactNode
  className?: string
  inputClassName?: string
  labelClassName?: string
}

export const ThaiFormField = forwardRef<HTMLInputElement, ThaiFormFieldProps>(
  (
    {
      label,
      error,
      required = false,
      description,
      icon,
      className,
      inputClassName,
      labelClassName,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${fieldId}-error`
    const descriptionId = `${fieldId}-description`

    return (
      <div className={cn("space-y-2", className)}>
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium thai-text",
            error && "text-red-600",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground thai-text"
          >
            {description}
          </p>
        )}

        <div className="relative">
          <Input
            id={fieldId}
            ref={ref}
            className={cn(
              "thai-text",
              icon && "pl-10",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" 
                : "input-tbat",
              inputClassName
            )}
            aria-invalid={!!error}
            aria-describedby={
              [
                error ? errorId : null,
                description ? descriptionId : null
              ].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 thai-text"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

ThaiFormField.displayName = "ThaiFormField"

// Thai-optimized Select Component
interface ThaiSelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  error?: string
  required?: boolean
  description?: string
  placeholder?: string
  className?: string
  selectClassName?: string
  labelClassName?: string
}

export const ThaiSelectField = forwardRef<HTMLSelectElement, ThaiSelectFieldProps>(
  (
    {
      label,
      options,
      error,
      required = false,
      description,
      placeholder = "กรุณาเลือก...",
      className,
      selectClassName,
      labelClassName,
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${fieldId}-error`
    const descriptionId = `${fieldId}-description`

    return (
      <div className={cn("space-y-2", className)}>
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium thai-text",
            error && "text-red-600",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground thai-text"
          >
            {description}
          </p>
        )}

        <select
          id={fieldId}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 thai-text",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" 
              : "input-tbat",
            selectClassName
          )}
          aria-invalid={!!error}
          aria-describedby={
            [
              error ? errorId : null,
              description ? descriptionId : null
            ].filter(Boolean).join(' ') || undefined
          }
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 thai-text"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

ThaiSelectField.displayName = "ThaiSelectField"

// Thai-optimized Textarea Component
interface ThaiTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
  textareaClassName?: string
  labelClassName?: string
}

export const ThaiTextareaField = forwardRef<HTMLTextAreaElement, ThaiTextareaFieldProps>(
  (
    {
      label,
      error,
      required = false,
      description,
      className,
      textareaClassName,
      labelClassName,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${fieldId}-error`
    const descriptionId = `${fieldId}-description`

    return (
      <div className={cn("space-y-2", className)}>
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium thai-text",
            error && "text-red-600",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-muted-foreground thai-text"
          >
            {description}
          </p>
        )}

        <textarea
          id={fieldId}
          ref={ref}
          rows={rows}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 thai-text",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" 
              : "input-tbat",
            textareaClassName
          )}
          aria-invalid={!!error}
          aria-describedby={
            [
              error ? errorId : null,
              description ? descriptionId : null
            ].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />

        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 thai-text"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

ThaiTextareaField.displayName = "ThaiTextareaField"

export default ThaiFormField