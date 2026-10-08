import { authorize } from "@/lib/api";
import { getDashboardStats } from "@/lib/stats";
import { bus } from "@/lib/events";

export const dynamic = "force-dynamic";

// Server-Sent Events: pushes fresh dashboard stats whenever something changes,
// plus a periodic refresh so changes from other server instances show up too.
export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let pending = null;

      const send = (event, data) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const pushStats = async () => {
        try {
          send("stats", await getDashboardStats());
        } catch (e) {
          console.error("[admin stream]", e);
        }
      };
      const onEvent = (evt) => {
        send("activity", evt);
        clearTimeout(pending);
        pending = setTimeout(pushStats, 150); // coalesce bursts
      };

      bus.on("event", onEvent);
      const refresh = setInterval(pushStats, 15000);
      const ping = setInterval(() => send("ping", { t: Date.now() }), 25000);

      cleanup = () => {
        if (closed) return;
        closed = true;
        bus.off("event", onEvent);
        clearInterval(refresh);
        clearInterval(ping);
        clearTimeout(pending);
        try {
          controller.close();
        } catch {}
      };
      request.signal.addEventListener("abort", cleanup);

      await pushStats();
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
