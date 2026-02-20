import { httpRequestCounter, httpRequestDuration } from "../lib/prom-client.js";

export const httpRequestDuration_middleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    end({
      method: req.method,
      status: res.statusCode,
      route: req.route?.path || req.path,
    });
  });

  next();
};

export const httpRequestCounter_middleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      status: res.statusCode,
      route: req.route?.path || req.path,
    });
  });

  next();
};
