import http from "node:http";
import handler from "serve-handler";

const port = Number(process.env.PORT || 3000);
const apiUrl = (process.env.API_URL || process.env.VITE_API_URL || "")
  .trim()
  .replace(/\/$/, "");

const server = http.createServer(async (request, response) => {
  if (request.url?.startsWith("/runtime-config.json")) {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify({ apiUrl }));
    return;
  }

  await handler(request, response, {
    public: "dist",
    rewrites: [{ source: "**", destination: "/index.html" }],
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`frontend listening on :${port}`);
  console.log(`runtime API_URL=${apiUrl || "(empty)"}`);
});
