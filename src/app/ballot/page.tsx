"use client";
import { useAccount } from "wagmi";
import { EmptyBallot, NonBadgeholder } from "@/components/ballot/ballot-states";
import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { ComponentProps, useState } from "react";
import { SubmitDialog } from "@/components/ballot/submit-dialog";
import { MetricsEditor } from "../../components/metrics-editor";
import { useBallot } from "@/hooks/useBallot";
import { useIsMutating } from "@tanstack/react-query";
import { useMetrics } from "@/hooks/useMetrics";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { useBallotContext } from "@/components/ballot/provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function BallotPage() {
  const { address, isConnecting } = useAccount();
  const { isPending } = useBallot(address);
  const { state } = useBallotContext();

  if (isPending) {
    return <Skeleton className="p-6 h-96" />;
  }
  if (!address && !isConnecting) {
    return <NonBadgeholder />;
  }
  const isEmptyBallot = !Object.keys(state).length;
  if (isEmptyBallot) {
    return <EmptyBallot />;
  }
  return <YourBallot />;
}

function YourBallot() {
  const [isSubmitting, setSubmitting] = useState(false);
  const { data: metrics, isPending } = useMetrics();

  return (
    <Card className="p-6 space-y-8">
      <MetricsEditor metrics={metrics} isLoading={isPending} />
      <OpenSourceMultiplier />

      <div className="flex items-center gap-4">
        <Button
          variant={"destructive"}
          type="submit"
          onClick={() => setSubmitting(true)}
        >
          Submit ballot
        </Button>
        <WeightsError />
        <IsSavingBallot />
      </div>

      <SubmitDialog
        open={isSubmitting}
        onOpenChange={() => setSubmitting(false)}
      />
    </Card>
  );
}

function OpenSourceMultiplier() {
  const [multiplier, setMultiplier] = useState(0);

  return (
    <Card className="p-4">
      <div className="space-y-4 mb-4">
        <div className="text-muted-foreground text-xs">Optional</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">
              Add an open source reward multiplier
            </div>
            <Badge
              variant={multiplier > 1 ? "destructive" : "secondary"}
              className="cursor-pointer"
              onClick={() => setMultiplier(0)}
            >
              {multiplier > 1 ? "On" : "Off"}
            </Badge>
          </div>

          <div className="flex gap-2 flex-1">
            <Slider
              value={[multiplier]}
              onValueChange={([v]) => setMultiplier(v)}
              min={1.0}
              step={0.1}
              max={4.1}
            />
            <NumericFormat
              customInput={OpenSourceInput}
              className="w-16"
              suffix="x"
              allowNegative={false}
              decimalScale={2}
              allowLeadingZeros={false}
              isAllowed={(values) => (values?.floatValue ?? 0) <= 4.1}
              onValueChange={({ floatValue }) => setMultiplier(floatValue ?? 0)}
              value={multiplier ?? 0}
              defaultValue={0}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          The reward multiplier takes your allocation and multiplies it&apos;s
          effects across open source projects. Choosing Max means you&apos;ll
          only reward open source projects. Projects must have open source
          licenses in all of their Github repos to qualify. We adhered to the
          Open Source Initiative&apos;s definition of open source software.{" "}
          <Link href="#" className="font-semibold">
            Learn more
          </Link>
        </div>
        <Separator />
      </div>
    </Card>
  );
}

function OpenSourceInput(props: ComponentProps<typeof Input>) {
  return (
    <Input {...props} value={props.value === "4.1x" ? "Max" : props.value} />
  );
}

function WeightsError() {
  const { ballot } = useBallotContext();
  const allocationSum = ballot?.allocations.reduce(
    (sum, x) => (sum += Number(x.allocation)),
    0
  );

  if (allocationSum === 100) return null;

  return (
    <span className="text-sm text-destructive">
      Weights must add up to 100%
    </span>
  );
}

function IsSavingBallot() {
  const isSavingBallot = useIsMutating({ mutationKey: ["save-ballot"] });

  return isSavingBallot ? (
    <span className="flex gap-2">
      <LoaderIcon className={"animate-spin size-4"} />
      <span className="text-xs">Saving ballot...</span>
    </span>
  ) : null;
}
