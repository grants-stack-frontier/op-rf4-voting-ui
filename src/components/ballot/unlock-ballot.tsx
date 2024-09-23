"use client";
import { RiLockUnlockFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { ComponentProps, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { LoadingDialog } from "../common/loading-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Button } from "../ui/button";

export function UnlockBallotDialog({
    isOpen,
    setOpen,
}: {
    isOpen: boolean;
    setOpen: ComponentProps<typeof AlertDialog>["onOpenChange"];
}) {
    const [isUnlockedLoading, setIsUnlockedLoading] = useState(false);
    const router = useRouter();
    const { address } = useAccount();

    const handleUnlock = useCallback(() => {
        setIsUnlockedLoading(true);
        setTimeout(() => {
            setIsUnlockedLoading(false);
            setOpen?.(false);
            if (address) {
                localStorage.setItem(`ballot_unlocked_${address}`, 'true');
            }
            router.push("/ballot");
        }, 2000);
    }, [router, setOpen, address]);

    return (
        <>
            <AlertDialog open={isOpen} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader className="flex flex-col items-center gap-4">
                        <AlertDialogTitle><RiLockUnlockFill className="w-16 h-16" /></AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-xl font-medium">Nice work! You&apos;re ready to unlock your ballot and allocate rewards</AlertDialogDescription>
                        <p className="text-sm">We&apos;ll use your scores to position projects in your unlocked ballot.</p>
                        <Button className="w-full" variant="destructive" onClick={handleUnlock} disabled={isUnlockedLoading}>Unlock ballot</Button>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            <LoadingDialog isOpen={isUnlockedLoading} setOpen={setIsUnlockedLoading} message="Unlocking your ballot" />
        </>
    );
}