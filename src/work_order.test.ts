import assert from "node:assert/strict";
import { decideNextAction, workOrderSchema } from "./work_order.js";

const parsed = workOrderSchema.parse({
  workOrderId: "WO-test",
  photoUrl: "https://example.com/photo.jpg",
  dispatchStatus: "on_site",
  technicianNote: "Check the breaker."
});

assert.equal(decideNextAction(parsed.dispatchStatus, "unsafe wiring visible"), "request_follow_up");
assert.equal(decideNextAction("complete", "looks good"), "close");
assert.throws(() => workOrderSchema.parse({ ...parsed, dispatchStatus: "unknown" }));
console.log("work-order decision test passed");
