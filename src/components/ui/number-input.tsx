import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hideSpinButtons?: boolean;
  decimalPlaces?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      type = 'number',
      hideSpinButtons = false,
      decimalPlaces,
      value,
      ...props
    },
    ref
  ) => {
    let formattedValue = value;

    if (decimalPlaces !== undefined && value !== undefined && value !== '') {
      const num = parseFloat(value as string);
      if (!isNaN(num)) {
        formattedValue = num.toFixed(decimalPlaces);
      }
    }

    return (
      <input
        type={type}
        value={formattedValue}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hideSpinButtons &&
            'appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
