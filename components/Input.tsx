import * as React from 'react'
import { Input as BaseInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InputProps extends React.ComponentProps<'input'> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}
        <BaseInput
          className={className}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }