# Incident Response Runbooks

This document contains runbooks for common incidents that may occur with the DevSecOps Demo Application. Runbooks provide step-by-step procedures for detecting, diagnosing, and resolving incidents.

---

## Runbook A: Service is Down or /health is Failing

### Severity: **CRITICAL**

### Description
The service is completely unavailable or the `/health` endpoint is returning errors or timeouts.

---

### Detection

#### Step 1: Check Health Endpoint
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "uptime": 1234.56,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "devsecops-demo"
}
```

**If failing**: Proceed to diagnosis.

#### Step 2: Check Service Status
```bash
# Check if process is running
ps aux | grep node

# Check if port is listening
lsof -i :3000
# or
netstat -an | grep 3000
```

#### Step 3: Check Application Logs
```bash
# If using PM2 or similar
pm2 logs devsecops-demo

# If running directly, check console output
# Look for error messages, stack traces
```

#### Step 4: Check System Resources
```bash
# Check CPU usage
top

# Check memory usage
free -h

# Check disk space
df -h
```

---

### Diagnosis

#### Step 1: Identify Root Cause

**Possible Causes**:
1. **Application crashed**: Check logs for unhandled exceptions
2. **Port conflict**: Another service using port 3000
3. **Out of memory**: Node.js process killed by OOM killer
4. **Missing environment variables**: JWT_SECRET not set
5. **Dependency issues**: Missing node_modules or corrupted files
6. **System resource exhaustion**: CPU, memory, or disk full

#### Step 2: Check Application Logs

Look for:
- Stack traces
- "JWT_SECRET environment variable is required" errors
- Port already in use errors
- Out of memory errors
- Database connection errors (if applicable)

#### Step 3: Check Environment Configuration

```bash
# Verify .env file exists and has required variables
cat .env | grep JWT_SECRET

# Check if PORT is set correctly
echo $PORT
```

---

### Recovery

#### Option 1: Restart the Service

```bash
# If using PM2
pm2 restart devsecops-demo

# If running directly
# Stop the process (Ctrl+C or kill)
# Then restart:
npm start
```

#### Option 2: Fix Configuration Issues

If missing environment variables:
```bash
# Copy example file
cp .env.example .env

# Edit and set required variables
nano .env
# Set JWT_SECRET and other required values

# Restart service
npm start
```

#### Option 3: Resolve Port Conflict

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change PORT in .env
# PORT=3001

# Restart service
npm start
```

#### Option 4: Free Up Resources

If system resources are exhausted:
```bash
# Free up memory
# Kill unnecessary processes
# Clear temporary files
# Restart the service
```

#### Option 5: Reinstall Dependencies

If dependency issues:
```bash
# Remove node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Restart service
npm start
```

---

### Validation

#### Step 1: Verify Health Endpoint
```bash
curl http://localhost:3000/health
```

Should return `{"status": "ok", ...}`

#### Step 2: Test Core Functionality
```bash
# Test login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Should return a JWT token
```

#### Step 3: Check Metrics Endpoint
```bash
curl http://localhost:3000/metrics
```

Should return Prometheus metrics.

#### Step 4: Monitor for Stability
- Watch logs for 5-10 minutes
- Check health endpoint periodically
- Verify no errors in metrics

---

### Escalation

**If recovery fails after 15 minutes**:
1. Document all steps taken
2. Collect logs and error messages
3. Check for recent code deployments or configuration changes
4. Escalate to senior engineer or team lead
5. Consider rolling back to previous version if applicable

**Contact Information**:
- On-call engineer: [Contact info]
- Team lead: [Contact info]
- Slack channel: #devsecops-incidents

---

## Runbook B: Error Rate or Latency Too High

### Severity: **HIGH**

### Description
The application is experiencing elevated error rates (4xx/5xx responses) or high latency (slow response times).

---

### Detection

#### Step 1: Check Prometheus Metrics

```bash
# Query error rate
curl 'http://localhost:3000/metrics' | grep http_requests_total

# Or use Prometheus query:
# rate(http_requests_total{status_code=~"4..|5.."}[5m])
```

**Thresholds**:
- **Warning**: Error rate > 1%
- **Critical**: Error rate > 5%

#### Step 2: Check Latency Metrics

```bash
# Query latency
curl 'http://localhost:3000/metrics' | grep http_request_duration_seconds

# Or use Prometheus query:
# histogram_quantile(0.95, http_request_duration_seconds)
```

**Thresholds**:
- **Warning**: p95 latency > 500ms
- **Critical**: p95 latency > 1000ms

#### Step 3: Check Application Logs

```bash
# Look for error patterns
grep -i error logs/app.log | tail -50

# Check for specific error types
grep -i "timeout" logs/app.log
grep -i "connection" logs/app.log
grep -i "failed" logs/app.log
```

#### Step 4: Check Recent Activity

```bash
# Check request volume
# High volume might cause performance issues

# Check for specific problematic endpoints
# Some endpoints might be slower than others
```

---

### Diagnosis

#### Step 1: Identify Error Patterns

**Common Error Types**:
1. **401 Unauthorized**: Authentication issues, expired tokens
2. **403 Forbidden**: Authorization failures, feature toggle issues
3. **404 Not Found**: Route not found, missing resources
4. **500 Internal Server Error**: Application bugs, unhandled exceptions
5. **503 Service Unavailable**: Dependencies down, resource exhaustion

#### Step 2: Analyze Latency Patterns

**Check**:
- Which endpoints are slow?
- Is latency consistent or intermittent?
- Are slow requests correlated with specific users or features?

#### Step 3: Check System Resources

```bash
# CPU usage
top

# Memory usage
free -h

# I/O wait
iostat -x 1

# Network issues
netstat -i
```

#### Step 4: Check Dependencies

```bash
# If using external services:
# - Database connectivity
# - External API responses
# - Third-party service status
```

#### Step 5: Review Recent Changes

- Recent code deployments
- Configuration changes
- Feature toggle changes
- Infrastructure changes

---

### Recovery

#### Option 1: Restart the Service

Sometimes a restart resolves transient issues:
```bash
pm2 restart devsecops-demo
# or
npm start
```

#### Option 2: Disable Problematic Features

If a specific feature is causing issues:
```bash
# Disable feature toggle via environment variable
export FEATURE_WELCOME_BANNER=false
export FEATURE_SPAM_REPORT_BUTTON=false

# Restart service
npm start
```

#### Option 3: Scale Resources

If resource exhaustion:
- Increase memory allocation
- Add more CPU resources
- Scale horizontally (add more instances)

#### Option 4: Rollback Configuration

If recent config changes caused issues:
```bash
# Revert .env changes
git checkout .env

# Or manually restore previous values
# Restart service
npm start
```

#### Option 5: Fix Code Issues

If specific code is causing errors:
1. Identify the problematic route/function
2. Check logs for stack traces
3. Apply hotfix or rollback to previous version
4. Deploy fix

#### Option 6: Rate Limiting

If high request volume is causing issues:
- Implement rate limiting
- Add request throttling
- Block abusive IPs (if applicable)

---

### Validation

#### Step 1: Monitor Error Rate

```bash
# Check if error rate is decreasing
# Monitor for 10-15 minutes
watch -n 5 'curl -s http://localhost:3000/metrics | grep http_requests_total'
```

#### Step 2: Monitor Latency

```bash
# Check if latency is improving
# Test endpoints directly
time curl http://localhost:3000/health
time curl http://localhost:3000/dashboard
```

#### Step 3: Verify Core Functionality

```bash
# Test login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoints with token
TOKEN="<your-token>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/dashboard
```

#### Step 4: Check Logs

```bash
# Verify no new errors
tail -f logs/app.log | grep -i error
```

---

### Escalation

**If error rate or latency doesn't improve after 30 minutes**:
1. Document all steps taken and findings
2. Collect metrics, logs, and error samples
3. Identify if issue affects all users or specific subset
4. Consider temporary service degradation (disable non-critical features)
5. Escalate to senior engineer or team lead
6. Prepare for post-mortem if issue is severe

**Contact Information**:
- On-call engineer: [Contact info]
- Team lead: [Contact info]
- Slack channel: #devsecops-incidents

---

## General Incident Response Guidelines

### Communication

1. **Update stakeholders**: Notify team and users if service is degraded
2. **Status page**: Update status page if available
3. **Documentation**: Document all actions taken during incident

### Post-Incident

1. **Post-mortem**: Conduct post-mortem within 48 hours
2. **Action items**: Create action items to prevent recurrence
3. **Update runbooks**: Improve runbooks based on lessons learned
4. **Monitor**: Increase monitoring/alerting if gaps were identified

### Prevention

1. **Monitoring**: Ensure comprehensive monitoring is in place
2. **Alerting**: Set up alerts for SLO violations
3. **Testing**: Regular load testing and chaos engineering
4. **Documentation**: Keep runbooks up to date

---

**For Assignment 12: Reliability Engineering**

