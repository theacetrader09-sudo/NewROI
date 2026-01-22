import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 20 },   // Ramp up to 20 users
        { duration: '1m', target: 20 },   // Stay at 20 users
        { duration: '30s', target: 50 },  // Spike to 50 users
        { duration: '1m', target: 50 },   // Stay at 50
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],     // 95% of requests under 500ms
        http_req_duration: ['p(99)<1000'],    // 99% under 1 second
        http_req_failed: ['rate<0.01'],       // Less than 1% errors
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Test 1: Homepage
    let res = http.get(`${BASE_URL}/`);
    check(res, {
        'homepage status is 200': (r) => r.status === 200,
        'homepage loads in <300ms': (r) => r.timings.duration < 300,
    });
    sleep(1);

    // Test 2: Signup page
    res = http.get(`${BASE_URL}/signup`);
    check(res, {
        'signup page loads': (r) => r.status === 200,
    });
    sleep(1);

    // Test 3: Login page
    res = http.get(`${BASE_URL}/login`);
    check(res, {
        'login page loads': (r) => r.status === 200,
    });
    sleep(1);

    // Test 4: Dashboard (unauthorized - should redirect)
    res = http.get(`${BASE_URL}/dashboard`, {
        redirects: 0,
    });
    check(res, {
        'unauthorized dashboard redirects': (r) => r.status === 307 || r.status === 302,
    });
    sleep(2);
}

export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'load-test-results.json': JSON.stringify(data),
    };
}

function textSummary(data, options = {}) {
    const indent = options.indent || '';
    const enableColors = options.enableColors || false;

    let summary = '\n';
    summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}\n`;
    summary += `${indent}Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
    summary += `${indent}Avg Duration: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;

    return summary;
}
