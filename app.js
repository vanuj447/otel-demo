const express = require('express');
const promClient = require('prom-client');
const os = require('os');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

const traceExporter = new OTLPTraceExporter({ url: 'http://tempo:4318/v1/traces' });
const metricExporter = new OTLPMetricExporter({ url: 'http://tempo:4318/v1/metrics' });

const sdk = new NodeSDK({
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({ exporter: metricExporter }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'example-otel-app'
});
sdk.start();

const app = express();
const PORT = 8080;

// Prometheus metrics
const counter = new promClient.Counter({ name: 'requests_total', help: 'Total requests', labelNames: ['route'] });
const cpuGauge = new promClient.Gauge({ name: 'cpu_usage_percent', help: 'CPU usage %' });
const memGauge = new promClient.Gauge({ name: 'memory_usage_bytes', help: 'Memory usage bytes' });

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function fakeDbQuery(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function heavyWork() {
  let sum = 0;
  for (let i = 0; i < 2e6; i++) sum += Math.sqrt(i);
  return sum;
}

app.get('/', async (req, res) => {
  counter.inc({ route: '/' });
  log('Received request: /');
  await fakeDbQuery();
  heavyWork();
  log('Request / completed');
  res.send('Hello from / endpoint!');
});

app.get('/health', (req, res) => {
  counter.inc({ route: '/health' });
  log('Health check OK');
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/slow', async (req, res) => {
  counter.inc({ route: '/slow' });
  log('Slow endpoint starting');
  await fakeDbQuery(1200);
  heavyWork();
  log('Slow endpoint done');
  res.send('This is a slow endpoint');
});

app.get('/error', (req, res) => {
  counter.inc({ route: '/error' });
  log('Error endpoint hit!');
  throw new Error('Simulated error!');
});

app.get('/metrics', async (req, res) => {
  // Update CPU/memory gauges
  const cpuLoad = (os.loadavg()[0] / os.cpus().length) * 100;
  cpuGauge.set(cpuLoad);
  memGauge.set(process.memoryUsage().rss);
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Error handler
app.use((err, req, res, next) => {
  log('Error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  log(`App listening on port ${PORT}`);
});
