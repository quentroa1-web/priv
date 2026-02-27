## 2025-05-15 - [ReDoS and User Enumeration]
**Vulnerability:** Regex Injection (ReDoS) and User Enumeration via verbose error messages.
**Learning:** Using user-supplied input directly in `new RegExp()` without escaping allows for catastrophic backtracking attacks (ReDoS). Providing specific error messages for non-existent users vs. incorrect passwords allows attackers to map out registered emails.
**Prevention:** Always escape special characters in user-supplied strings before using them in regular expressions. Use uniform, generic error messages for all authentication failures.

## 2025-05-16 - [IP Spoofing via Rate Limiter]
**Vulnerability:** IP Spoofing in Rate Limiter due to manual `x-forwarded-for` extraction.
**Learning:** Manually extracting `x-forwarded-for` in `keyGenerator` without validation allows attackers to bypass rate limits by spoofing headers.
**Prevention:** Use `app.set('trust proxy', 1)` and rely on `req.ip` for rate limiting to ensure the IP is correctly identified by the first trusted proxy.
