import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderId: z.string().min(1),
  photoUrl: z.string().url(),
  dispatchStatus: z.enum(["queued", "en_route", "on_site", "complete"]),
  technicianNote: z.string().min(1)
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export type CostedAssessment = {
  workOrderId: string;
  summary: string;
  nextAction: "dispatch" | "request_follow_up" | "close";
  costUsd: number | null;
  vendor: string | null;
};

export function decideNextAction(status: WorkOrder["dispatchStatus"], summary: string): CostedAssessment["nextAction"] {
  if (status === "complete") return "close";
  if (/unsafe|missing|unclear/i.test(summary)) return "request_follow_up";
  return "dispatch";
}
