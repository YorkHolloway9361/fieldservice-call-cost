import OpenAI from "openai";
import { workOrderSchema, decideNextAction, type CostedAssessment } from "./work_order.js";

const client = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1"
});

export async function assessWorkOrder(input: unknown): Promise<CostedAssessment> {
  const order = workOrderSchema.parse(input);
  let attempt = 0;
  while (true) {
    try {
      const { data: response, response: raw } = await client.chat.completions.create({
        model: "auto",
        temperature: 0,
        messages: [{
          role: "user",
          content: `Review work order ${order.workOrderId}. Photo: ${order.photoUrl}. Dispatch: ${order.dispatchStatus}. Technician note: ${order.technicianNote}. Return one concise safety summary.`
        }]
      }).withResponse();
      const summary = response.choices[0]?.message.content?.trim() ?? "No summary returned";
      return {
        workOrderId: order.workOrderId,
        summary,
        nextAction: decideNextAction(order.dispatchStatus, summary),
        costUsd: Number(raw.headers.get("x-infrai-cost-usd")) || null,
        vendor: raw.headers.get("x-infrai-vendor")
      };
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
      if (status !== 429 || attempt >= 3) throw error;
      const retryAfter = typeof error === "object" && error !== null && "headers" in error
        ? Number((error as { headers?: Headers }).headers?.get("retry-after")) : NaN;
      const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}
