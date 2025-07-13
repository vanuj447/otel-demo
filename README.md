# OpenTelemetry Demo Stack

This repository contains a fully working observability demo stack using Docker Compose. It includes:

- **Node.js App**: Generates logs, metrics (Prometheus), and traces (OpenTelemetry)
- **Prometheus**: Scrapes metrics from the app
- **Tempo**: Collects traces using OTLP (local storage)
- **Loki**: Stores logs
- **Promtail**: Scrapes container logs and forwards to Loki
- **Grafana**: Visualizes metrics, logs, and traces
- **Load Generator**: Automatically sends traffic to the app so you always see data

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vanuj447/otel-demo.git
cd repo
```

### 2. Build and Start the Stack

```bash
docker compose up --build
```

### 3. Access Grafana

- URL: [http://localhost:3000](http://localhost:3000)
- Login: `admin` / `admin`

### 4. Import the Dashboard

- Go to **Dashboards > Import** in Grafana
- Paste or upload the provided `otel-demo-dashboard.json`

---

## Project Structure

- `app.js` – Node.js app with metrics, logs, traces
- `Dockerfile` – Build config for the app
- `package.json` – App dependencies
- `loadgen.Dockerfile` – Dockerfile for load generator
- `prometheus.yml` – Prometheus scrape config
- `tempo.yaml` – Tempo config (local storage)
- `promtail-config.yml` – Promtail config for scraping Docker logs
- `docker-compose.yml` – Orchestrates the entire stack
- `otel-demo-dashboard.json` – Pre-made Grafana dashboard

---

## How It Works

- **App**: Logs to stdout, exposes `/metrics`, sends traces via OTLP
- **Loadgen**: Continuously generates traffic to simulate real load
- **Prometheus**: Scrapes `/metrics` endpoint for metrics
- **Tempo**: Receives and stores traces from the app
- **Promtail**: Scrapes container logs and forwards to Loki
- **Loki**: Stores and enables querying of logs
- **Grafana**: Visualizes everything; panels show request rate, CPU/memory usage, traces, and logs

---

## Endpoints

- `GET /` – Fast endpoint
- `GET /slow` – Simulates slow response
- `GET /error` – Always returns error (for testing logs/traces)
- `GET /health` – Health check
- `GET /metrics` – Prometheus metrics scrape endpoint

---

## Customization

- Tune traffic in `loadgen.Dockerfile`
- Add more metrics/tracing to the app
- Extend dashboards in Grafana

---

## Troubleshooting

- **Tempo won’t start:** Check your `tempo.yaml` for correct `storage` backend (`local` for demo)
- **No logs in Grafana:** Ensure Promtail is running and scraping logs
- **No traces in Grafana:** Check app’s OTLP endpoint and Tempo config
- **Prometheus errors:** Check Prometheus targets in `prometheus.yml`

---

## License

MIT

---

## Credits

- [Grafana Labs](https://grafana.com/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Prometheus](https://prometheus.io/)
