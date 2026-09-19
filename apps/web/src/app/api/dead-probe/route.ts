// Probe endpoint used by UI verification to emulate an unreachable API:
// accepts the connection then destroys it, producing ERR_CONNECTION_REFUSED-style
// failures identical to a dead backend — confirming the client fallback path.
export function GET() {
  return new Response(null, { status: 502 })
}
