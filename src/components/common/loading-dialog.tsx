'use client';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { ComponentProps } from 'react';
import { AlertDialog, AlertDialogContent } from '../ui/alert-dialog';

export function LoadingDialog({
  isOpen,
  setOpen,
  message = 'Loading',
}: {
  isOpen: boolean;
  setOpen: ComponentProps<typeof AlertDialog>['onOpenChange'];
  message?: string;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogTitle></AlertDialogTitle>
        <div className="flex flex-col items-center gap-2">
          <div
            className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="font-medium">{message}...</p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
