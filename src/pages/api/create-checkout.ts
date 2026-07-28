// Phase 2: Replace with Dodo Payments integration
export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({ error: "Payments not enabled — launching soon" }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
