import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

// Collect default Node.js metrics
client.collectDefaultMetrics({
  register,
  prefix: "node_",
});

// Optional: custom metric example
export const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  labelNames: ["method", "status", "route"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

export const metrics = async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
};
