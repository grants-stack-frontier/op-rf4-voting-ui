import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  hideSpinButtons?: boolean;
  min?: number;
  max?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  symbol?: string;
  maxDecimals?: number;
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
      symbol,
      maxDecimals,
      ...props
    },
    ref
  ) => {
    const originalValueRef = React.useRef<string>(value?.toString() || '');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      originalValueRef.current = e.target.value;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove any non-numeric characters except for the decimal point
      inputValue = inputValue.replace(/[^0-9.]/g, '');

      // If maxDecimals is specified, limit the number of decimal places
      if (typeof maxDecimals === 'number') {
        const parts = inputValue.split('.');
        if (parts[1]?.length > maxDecimals) {
          parts[1] = parts[1].substring(0, maxDecimals);
          inputValue = parts.join('.');
        }
      }

      e.target.value = inputValue;

      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let finalValue = e.target.value;
      let numericValue = parseFloat(finalValue);

      if (!isNaN(numericValue)) {
        if (typeof min === 'number' && numericValue < min) {
          numericValue = min;
          finalValue = min.toString();
        }
        if (typeof max === 'number' && numericValue > max) {
          numericValue = max;
          finalValue = max.toString();
        }

        // Round to the specified number of decimal places
        if (typeof maxDecimals === 'number') {
          numericValue = parseFloat(numericValue.toFixed(maxDecimals));
          finalValue = numericValue.toString();
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
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*"
          value={value}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
        {symbol && (
          <span className="absolute inset-y-0 right-8 flex items-center pointer-events-none text-muted-foreground">
            {symbol}
          </span>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
