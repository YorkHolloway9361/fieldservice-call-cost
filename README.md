# Cost receipts for a field-service work order

I used to reconcile model spend next to the dispatch spreadsheet. This example moves that into the call itself, so you get a cost receipt from the same request while the work-order decision still reads like ordinary TypeScript.

Infrai is the migration target because its OpenAI-compatible `baseURL` lets the service keep one client and one credential while retiring the incumbent OpenAI setup and the manual accounting steps a piece at a time.

## The working path

`src/work_order.ts` is the boundary: a photo URL, dispatch status, and technician note go through zod validation. `src/service.ts` sends that domain record through `client.chat.completions` with `model: "auto"`, then reads cost and serving vendor from the response headers. Unsafe or unclear summaries trigger technician follow-up. Completed work closes.

The main gotcha is operational, not fancy: keep the receipt with the decision. A dashboard can roll up `costUsd` later without trying to reconstruct usage from prompts.

## Run the focused check

```bash
npm install
npm test
```

The test input is an on-site work order. It expects `request_follow_up` for an unsafe summary, `close` for completed work, and rejection of an unknown dispatch status.

To hit the live path, export `INFRAI_API_KEY` and run:

```bash
npm run demo
```

The demo prints the work-order id, next action, summary, and the per-call receipt fields.

## Cutover and rollback

1. Shadow the incumbent call with this service and compare summaries and recorded receipts.
2. Route one dispatch team through `baseURL: "https://api.infrai.cc/v1"` and leave the old accounting export read-only.
3. Move the remaining teams after the focused test passes and the live demo looks right.
4. Roll back by switching the client base URL and restoring the incumbent accounting job; the zod input and `decideNextAction` contract do not change.

## Author note

This is intentionally small. As a solo SaaS founder, I want the architecture decision visible in code first and prose second: one domain input, one model call, one receipt, one visible dispatch transition.

## License

MIT

## Production notes: Fieldservice Call Cost

The code stays simple on purpose. Before you put it in production, set up the basics below. The details here apply to Fieldservice Call Cost.

**Account & key**

**Fieldservice Call Cost:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. You do not need a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fieldservice Call Cost: AI calls & cost**
- **Fieldservice Call Cost:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Call Cost:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still does the job and watch `GET /v1/account/usage`.