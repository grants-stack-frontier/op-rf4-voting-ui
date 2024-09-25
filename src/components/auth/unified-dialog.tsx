import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface UnifiedDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  emoji?: string;
  children?: React.ReactNode;
}

export const UnifiedDialog: React.FC<UnifiedDialogProps> = ({
  open,
  onClose,
  title,
  description,
  emoji,
  children,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[458px]">
        <DialogHeader>
          {emoji && (
            <div className="flex justify-center items-center mb-4 text-5xl">
              {emoji}
            </div>
          )}
          <DialogTitle className="text-[#0F111A] dark:text-white text-center text-xl font-semibold leading-7 mb-4">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[#404454] dark:text-[#B0B3B8] text-center text-base font-normal leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children && <div className="mt-4">{children}</div>}
      </DialogContent>
    </Dialog>
  );
};
