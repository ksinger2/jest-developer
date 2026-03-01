# TASK-004 Track B Spike Report: Jest Webview Fetch Capability

**Status:** PRELIMINARY (tests written, awaiting Jest deployment for real results)
**Created:** 2026-02-27
**Author:** DevOps / Frontend Lead
**Depends on:** Jest Developer Console access (account approval pending)
**Blocks:** TASK-010 (Backend Verification Server)

---

## 1. Objective

Determine whether `fetch()` calls to external domains are permitted from within
the Jest game webview. This is the critical gating question for our backend
verification architecture: if the Jest webview blocks outbound network requests
(via Content Security Policy, iframe sandbox attributes, or other restrictions),
we cannot use a Cloudflare Worker backend to validate game scores.

## 2. Background

The Jest platform loads HTML5 games inside a webview (likely an iframe or system
webview). The Jest SDK documentation does not address network restrictions:

- The SDK is loaded via `<script src="https://cdn.jest.com/sdk/latest/jest-sdk.js">`
- The SDK provides `playerData` storage (1 MB, shallow merge) for persistence
- There are **no documented network-related APIs** in the Jest SDK itself
- CSP headers and sandbox attributes are **not documented**

Because the documentation is silent on this, we must test empirically.

## 3. What We Are Testing

| # | Test | URL | Purpose |
|---|------|-----|---------|
| 1 | Simple GET | `https://httpbin.org/get` | Can the webview fetch external JSON? |
| 2 | POST with body | `https://httpbin.org/post` | Can we send data (score payloads) out? |
| 3 | CORS preflight | `https://httpbin.org/post` + custom header | Does the browser allow OPTIONS preflight? |
| 4 | Worker endpoint | `https://gem-link-api.example.workers.dev/verify` | Is our backend URL pattern reachable? |

Additionally, the test page:
- Scans for `<meta>` CSP tags in the document
- Listens for `SecurityPolicyViolationEvent` to detect header-based CSP blocks
- Records timing information to distinguish policy blocks (instant) from network errors (slow)
- Logs the execution environment (user-agent, protocol, origin, iframe status)

## 4. Test Methodology

### Test artifact
- File: `gem-link/test/fetch-spike.html`
- Self-contained HTML (no TypeScript, no build step, no imports)
- Manual trigger via "Run Tests" button
- All results logged to a visible `<pre>` element with color-coded output

### How to run locally
```bash
npm run spike:fetch
# Opens http://localhost:3001/test/fetch-spike.html in your browser
```

### How to run on Jest (the real test)
1. Upload the built game to Jest Developer Console (with the test page included)
2. Navigate to or load `fetch-spike.html` from within the Jest webview
3. Click "Run Tests"
4. Screenshot or copy the log output

**IMPORTANT:** Local browser results only prove the test page works. The
results that matter are from inside the Jest webview, since that is where CSP
and sandbox restrictions (if any) will be enforced.

## 5. Result Scenarios

### Scenario A: fetch() Works (GET + POST)

**Indicators:**
- TEST 1 (GET): PASS
- TEST 2 (POST): PASS
- TEST 3 (CORS): PASS or PARTIAL
- TEST 4 (Worker): DNS FAIL or TIMEOUT (expected until real worker is deployed)

**Action:**
- Proceed with TASK-010: Deploy Cloudflare Worker backend
- Implement score verification: game POSTs score + proof to worker
- Worker validates, returns signed token
- Game submits signed token to Jest SDK
- Full anti-cheat pipeline is viable

### Scenario B: fetch() Blocked by CSP

**Indicators:**
- All tests FAIL
- `SecurityPolicyViolationEvent` fires
- Errors contain "Content Security Policy" or instant (<50ms) "Failed to fetch"

**Action:**
- **No backend server** (TASK-010 is cancelled or deferred)
- All validation must be client-only
- Score obfuscation via client-side hashing (weaker but workable)
- Use Jest `playerData` for state persistence instead of server sync
- Accept that client-only validation is gameable but sufficient for launch

### Scenario C: Partial fetch() (GET only, POST blocked)

**Indicators:**
- TEST 1 (GET): PASS
- TEST 2 (POST): FAIL
- Other tests: mixed

**Action:**
- Limited backend integration using GET-based verification
- Encode score proof in query parameters: `GET /verify?score=X&proof=Y`
- Less ideal (URL length limits, no request body) but still enables server validation
- Alternatively: use a GET-based polling/challenge model

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Jest blocks all fetch() | Medium | High — no backend verification | Fall back to client-only (Scenario B) |
| Jest allows GET but blocks POST | Low | Medium — awkward but workable | GET-based verify endpoint (Scenario C) |
| CSP allows workers.dev specifically | Unknown | Positive — best case | Test with real worker URL once deployed |
| Jest changes CSP policy later | Low | High — breaks production | Monitor; keep client-only fallback ready |
| httpbin.org is down during test | Low | Low — delays spike | Use alternative echo service or custom worker |

## 7. Recommendations

1. **Deploy `fetch-spike.html` as the first upload to Jest Developer Console.**
   Before investing time in TASK-010 (backend worker), we need to know if the
   network path exists. A 5-minute test saves potentially days of wasted work.

2. **If Scenario A:** Fast-track TASK-010. The backend worker at
   `gem-link-api.<subdomain>.workers.dev` becomes the verification authority.

3. **If Scenario B:** Pivot to a client-only architecture. This is not ideal
   for anti-cheat, but is acceptable for an MVP launch.

4. **If Scenario C:** Evaluate whether GET-based verification is sufficient.
   If not, fall back to Scenario B.

5. **Regardless of outcome:** Keep the test page in the repo. It serves as a
   regression check if Jest changes their webview policy in the future.

## 8. Local Test Results

> **This section should be updated with actual local test output.**

### Environment
- Date: 2026-02-27
- Browser: (run `npm run spike:fetch` and record)
- Protocol: http://localhost:3001

### Results
```
(Paste output from running the test page locally here)
```

### Interpretation
Local results confirm the test page functions correctly but do NOT reflect
Jest webview restrictions. Jest-specific results must be obtained by deploying
to the Jest Developer Console.

---

## 9. Files

| File | Purpose |
|------|---------|
| `test/fetch-spike.html` | Self-contained fetch capability test page |
| `plans/TASK-004-track-b-spike-report.md` | This report |

## 10. Next Steps

- [ ] Obtain Jest Developer Console access
- [ ] Upload game build (or standalone test page) to Jest
- [ ] Run fetch spike test inside Jest webview
- [ ] Update this report with real results
- [ ] Based on results, proceed with Scenario A, B, or C
- [ ] If Scenario A: begin TASK-010 (Cloudflare Worker)
