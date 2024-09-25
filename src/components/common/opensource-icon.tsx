import { ComponentProps } from 'react';

export function OpenSourceIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.0005 0C7.7619 0 10.0005 2.23857 10.0005 5C10.0005 7.0651 8.7485 8.83785 6.96215 9.6005L5.7029 6.3257C6.1774 6.0738 6.5005 5.57465 6.5005 5C6.5005 4.17155 5.8289 3.5 5.0005 3.5C4.17205 3.5 3.50049 4.17155 3.50049 5C3.50049 5.57485 3.82383 6.07415 4.29855 6.32595L3.03931 9.6007C1.2527 8.83815 0.000488281 7.0653 0.000488281 5C0.000488281 2.23857 2.23906 0 5.0005 0Z"
        fill="#3374DB"
      />
    </svg>
  );
}
