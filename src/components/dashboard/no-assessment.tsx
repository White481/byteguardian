import { ClipboardCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

/** Shown on result pages before the first assessment is completed */
export function NoAssessment({ what = "results" }: { what?: string }) {
  return (
    <Card>
      <CardBody className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <ClipboardCheck className="size-10 text-accent" />
        <p className="text-lg font-semibold">No {what} yet</p>
        <p className="max-w-sm text-sm text-muted">
          Complete your first assessment to see your maturity scores, risks and AI recommendations here.
        </p>
        <ButtonLink href="/assessment" className="mt-2">
          Start assessment
        </ButtonLink>
      </CardBody>
    </Card>
  );
}
