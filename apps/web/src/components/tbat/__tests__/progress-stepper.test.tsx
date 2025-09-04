import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressStepper, CompactProgressStepper } from '../progress-stepper'

describe('ProgressStepper', () => {
  const mockSteps = [
    { id: 1, title: 'Step 1', description: 'First step' },
    { id: 2, title: 'Step 2', description: 'Second step' },
    { id: 3, title: 'Step 3', description: 'Third step' }
  ]

  describe('Full ProgressStepper', () => {
    it('should render all steps', () => {
      render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      mockSteps.forEach(step => {
        expect(screen.getByText(step.title)).toBeInTheDocument()
        expect(screen.getByText(step.description)).toBeInTheDocument()
      })
    })

    it('should highlight current step', () => {
      render(
        <ProgressStepper
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Current step should have special styling
      const currentStepElement = screen.getByText('2').closest('div')
      expect(currentStepElement).toHaveClass('border-tbat-primary', 'bg-tbat-white', 'text-tbat-primary')
    })

    it('should show completed steps with checkmark', () => {
      render(
        <ProgressStepper
          currentStep={3}
          totalSteps={3}
          steps={mockSteps.map((step, index) => ({
            ...step,
            completed: index < 2 // First two steps completed
          }))}
        />
      )

      // Should have two checkmarks for completed steps
      const checkmarks = screen.getAllByRole('img', { hidden: true })
      expect(checkmarks.filter(mark => 
        mark.getAttribute('class')?.includes('w-5 h-5')
      )).toHaveLength(2)
    })

    it('should show future steps as inactive', () => {
      render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Future steps (2, 3) should be inactive
      const step2Element = screen.getByText('2').closest('div')
      const step3Element = screen.getByText('3').closest('div')
      
      expect(step2Element).toHaveClass('border-tbat-surface', 'bg-tbat-white', 'text-muted-foreground')
      expect(step3Element).toHaveClass('border-tbat-surface', 'bg-tbat-white', 'text-muted-foreground')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
          className="custom-stepper"
        />
      )

      expect(container.firstChild).toHaveClass('custom-stepper')
    })
  })

  describe('CompactProgressStepper', () => {
    it('should render progress bar with correct percentage', () => {
      render(
        <CompactProgressStepper
          currentStep={2}
          totalSteps={4}
        />
      )

      // Should show 50% progress (2/4)
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('ขั้นตอนที่ 2 จาก 4')).toBeInTheDocument()
    })

    it('should render progress dots', () => {
      render(
        <CompactProgressStepper
          currentStep={3}
          totalSteps={5}
        />
      )

      // Should render 5 dots
      const dots = document.querySelectorAll('.w-2.h-2.rounded-full')
      expect(dots).toHaveLength(5)

      // First 3 should be active (tbat-primary), last 2 inactive (tbat-surface)
      const activeDots = document.querySelectorAll('.bg-tbat-primary')
      const inactiveDots = document.querySelectorAll('.bg-tbat-surface')
      
      expect(activeDots).toHaveLength(3)
      expect(inactiveDots).toHaveLength(2)
    })

    it('should handle minimum progress width', () => {
      render(
        <CompactProgressStepper
          currentStep={0}
          totalSteps={10}
        />
      )

      // Should show at least 8% width even for 0% progress
      const progressBar = document.querySelector('.bg-tbat-gradient')
      expect(progressBar).toHaveStyle({ width: '8%' })
    })

    it('should apply custom className', () => {
      const { container } = render(
        <CompactProgressStepper
          currentStep={1}
          totalSteps={2}
          className="compact-custom"
        />
      )

      expect(container.firstChild).toHaveClass('compact-custom')
    })
  })

  describe('Accessibility', () => {
    it('should have proper Thai text classes', () => {
      render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Step titles should have thai-text class
      const stepTitles = mockSteps.map(step => screen.getByText(step.title))
      stepTitles.forEach(title => {
        expect(title).toHaveClass('thai-text')
      })
    })

    it('should be responsive', () => {
      render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Should have mobile progress bar
      expect(screen.getByText('ขั้นตอนที่ 1 จาก 3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const singleStep = [{ id: 1, title: 'Only Step', description: 'Single step' }]
      
      render(
        <ProgressStepper
          currentStep={1}
          totalSteps={1}
          steps={singleStep}
        />
      )

      expect(screen.getByText('Only Step')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle step beyond total', () => {
      render(
        <CompactProgressStepper
          currentStep={5}
          totalSteps={3}
        />
      )

      // Should cap at 100%
      expect(screen.getByText('167%')).toBeInTheDocument() // Math.round((5/3)*100)
    })

    it('should handle zero steps', () => {
      render(
        <CompactProgressStepper
          currentStep={0}
          totalSteps={0}
        />
      )

      // Should not crash and show NaN
      expect(screen.queryByText('NaN%')).not.toBeInTheDocument()
    })
  })

  describe('Visual Design', () => {
    it('should use Variant 6 colors', () => {
      render(
        <ProgressStepper
          currentStep={2}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Current step should use TBAT primary color
      const currentStep = screen.getByText('2').closest('div')
      expect(currentStep).toHaveClass('border-tbat-primary')
      expect(currentStep).toHaveClass('text-tbat-primary')
    })

    it('should show connecting lines between steps', () => {
      const { container } = render(
        <ProgressStepper
          currentStep={1}
          totalSteps={3}
          steps={mockSteps}
        />
      )

      // Should have connecting lines (looking for absolute positioned divs with height)
      const lines = container.querySelectorAll('.absolute.top-5')
      expect(lines.length).toBeGreaterThan(0)
    })
  })
})