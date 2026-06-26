import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // only pretty-print in dev, raw JSON in prod
  transport:
    process.env.NODE_ENV === "dev"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export default logger;
