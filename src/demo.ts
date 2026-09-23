import { assessWorkOrder } from "./service.js";

const result = await assessWorkOrder({
  workOrderId: "WO-1042",
  photoUrl: "https://example.com/panel.jpg",
  dispatchStatus: "on_site",
  technicianNote: "Panel is open; verify the loose neutral before closing."
});

console.log(JSON.stringify(result, null, 2));
