# Reliability Engineering Documentation

This document describes the **Service Level Indicators (SLIs)**, **Service Level Objectives (SLOs)**, and **Service Level Agreements (SLAs)** for the DevSecOps Demo Application.

## 📊 Service Level Indicators (SLIs)

SLIs are measurable metrics that indicate the quality of service. This application supports the following SLIs:

### 1. Availability SLI

**Definition**: Percentage of successful HTTP responses (2xx status codes) out of total requests.

**Measurement**:
- **Metric**: `http_requests_total` (from Prometheus)
- **Calculation**: `(count of 2xx responses) / (total requests) * 100`
- **Time Window**: Rolling 30-day window
- **Data Source**: Prometheus metrics endpoint (`/metrics`)

**Example Query** (PromQL):
```promql
sum(rate(http_requests_total{status_code=~"2.."}[30d])) / 
sum(rate(http_requests_total[30d])) * 100
```

### 2. Latency SLI

**Definition**: Percentage of requests that complete within a specified time threshold.

**Measurement**:
- **Metric**: `http_request_duration_seconds` (histogram)
- **Calculation**: `(requests under threshold) / (total requests) * 100`
- **Threshold**: 200ms (0.2 seconds) for dashboard and messages endpoints
- **Time Window**: Rolling 30-day window

**Example Query** (PromQL):
```promql
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket[30d])) by (le)
)
```

### 3. Error Rate SLI

**Definition**: Percentage of requests that result in error status codes (4xx, 5xx).

**Measurement**:
- **Metric**: `http_requests_total` (from Prometheus)
- **Calculation**: `(count of 4xx + 5xx responses) / (total requests) * 100`
- **Time Window**: Rolling 30-day window

**Example Query** (PromQL):
```promql
sum(rate(http_requests_total{status_code=~"4..|5.."}[30d])) / 
sum(rate(http_requests_total[30d])) * 100
```

### 4. Health Check SLI

**Definition**: Percentage of time the `/health` endpoint returns `status: "ok"`.

**Measurement**:
- **Endpoint**: `GET /health`
- **Calculation**: `(successful health checks) / (total health checks) * 100`
- **Time Window**: Rolling 30-day window
- **Monitoring**: External monitoring service (e.g., UptimeRobot, Pingdom)

## 🎯 Service Level Objectives (SLOs)

SLOs are specific targets for SLIs. Below are example SLOs for this application:

### SLO 1: Availability

**Objective**: 99.5% of requests to `/dashboard` and `/messages` should respond with HTTP 2xx status codes.

- **SLI**: Availability (2xx responses)
- **Target**: 99.5%
- **Time Window**: 30-day rolling window
- **Measurement**: Prometheus metrics

**Rationale**: This allows for up to 0.5% of requests to fail, which accounts for:
- Planned maintenance
- Transient errors
- Network issues
- Database connection problems (if applicable)

### SLO 2: Latency

**Objective**: 95% of requests to `/dashboard` and `/messages` should complete in under 200ms.

- **SLI**: Latency (p95)
- **Target**: 200ms (0.2 seconds)
- **Time Window**: 30-day rolling window
- **Measurement**: Prometheus histogram metrics

**Rationale**: Fast response times improve user experience. The p95 threshold ensures most users experience good performance.

### SLO 3: Error Rate

**Objective**: Less than 0.1% of requests should result in 5xx (server error) status codes.

- **SLI**: Error rate (5xx responses)
- **Target**: < 0.1%
- **Time Window**: 30-day rolling window
- **Measurement**: Prometheus metrics

**Rationale**: Server errors indicate application bugs or infrastructure issues. Keeping this low ensures reliability.

### SLO 4: Health Check Availability

**Objective**: The `/health` endpoint should return `status: "ok"` 99.9% of the time.

- **SLI**: Health check success rate
- **Target**: 99.9%
- **Time Window**: 30-day rolling window
- **Measurement**: External monitoring service

**Rationale**: Health checks are critical for monitoring and alerting. High availability ensures we can detect issues quickly.

## 📋 Service Level Agreement (SLA)

### SLA Statement

**Service**: DevSecOps Demo Application

**Availability Commitment**: The service will maintain 99.5% availability for core endpoints (`/dashboard`, `/messages`) over any 30-day period.

**Performance Commitment**: 95% of requests to core endpoints will complete in under 200ms.

**Error Rate Commitment**: Less than 0.1% of requests will result in server errors (5xx).

**Measurement Period**: Rolling 30-day window

**Remediation**: If the service fails to meet these commitments:
1. **First violation**: Investigation and root cause analysis within 24 hours
2. **Recurring violations**: Service improvement plan and timeline communicated to stakeholders
3. **Extended outages**: Post-mortem report and preventive measures implemented

**Exclusions**:
- Planned maintenance windows (with 48-hour advance notice)
- Force majeure events
- DDoS attacks or security incidents
- Third-party service dependencies outside our control

**Monitoring**: 
- Real-time monitoring via Prometheus metrics
- Health check monitoring via external service
- Alerting configured for SLO violations

**Review**: This SLA is reviewed quarterly and updated based on:
- Historical performance data
- Business requirements
- Infrastructure improvements

## 📈 Monitoring and Alerting

### Key Metrics to Monitor

1. **Request Rate**: `rate(http_requests_total[5m])`
2. **Error Rate**: `rate(http_requests_total{status_code=~"4..|5.."}[5m])`
3. **Latency (p95)**: `histogram_quantile(0.95, http_request_duration_seconds)`
4. **Health Status**: External monitoring of `/health` endpoint

### Alert Thresholds

- **Availability < 99%**: Warning alert
- **Availability < 95%**: Critical alert
- **Latency p95 > 500ms**: Warning alert
- **Latency p95 > 1000ms**: Critical alert
- **Error rate > 1%**: Warning alert
- **Error rate > 5%**: Critical alert
- **Health check down**: Critical alert

## 🔄 SLO Burn Rate

The "error budget" is the allowed failure rate. For a 99.5% SLO:
- **Error Budget**: 0.5% of requests can fail
- **Burn Rate**: How quickly we're consuming the error budget

**Example**: If we have 1,000,000 requests per month:
- **Allowed Failures**: 5,000 requests (0.5%)
- **Daily Budget**: ~167 failures per day

Monitoring burn rate helps prevent SLO violations by alerting early when we're consuming the budget too quickly.

## 📝 Notes

- These SLIs, SLOs, and SLA are **examples** for educational purposes
- In production, SLOs should be based on:
  - User experience requirements
  - Business objectives
  - Historical performance data
  - Infrastructure capabilities
- SLOs should be reviewed and adjusted regularly
- Different endpoints may have different SLOs based on importance

---

**For Assignment 12: Reliability Engineering**

