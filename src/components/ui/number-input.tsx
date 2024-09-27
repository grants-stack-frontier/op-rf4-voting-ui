import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  hideSpinButtons?: boolean;
  min?: number;
  max?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      hideSpinButtons = false,
      min,
      max,
      value,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const originalValueRef = React.useRef<string>(value?.toString() || '');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      originalValueRef.current = e.target.value;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let finalValue = e.target.value;
      const numericValue = parseFloat(finalValue);

      if (!isNaN(numericValue)) {
        if (typeof min === 'number') {
          numericValue < min && (finalValue = min.toString());
        }
        if (typeof max === 'number') {
          numericValue > max && (finalValue = max.toString());
        }
      } else {
        // If the value is invalid, revert to the original value
        finalValue = originalValueRef.current;
      }

      // If the final value is different from the original value, trigger onChange
      if (finalValue !== originalValueRef.current) {
        e.target.value = finalValue;
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: finalValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hideSpinButtons &&
            'appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
