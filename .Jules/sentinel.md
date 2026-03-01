## 2025-05-15 - [ReDoS and User Enumeration]
**Vulnerability:** Regex Injection (ReDoS) and User Enumeration via verbose error messages.
**Learning:** Using user-supplied input directly in `new RegExp()` without escaping allows for catastrophic backtracking attacks (ReDoS). Providing specific error messages for non-existent users vs. incorrect passwords allows attackers to map out registered emails.
**Prevention:** Always escape special characters in user-supplied strings before using them in regular expressions. Use uniform, generic error messages for all authentication failures.

## 2025-05-16 - [IP Spoofing via Rate Limiter]
**Vulnerability:** IP Spoofing in Rate Limiter due to manual `x-forwarded-for` extraction.
**Learning:** Manually extracting `x-forwarded-for` in `keyGenerator` without validation allows attackers to bypass rate limits by spoofing headers.
**Prevention:** Use `app.set('trust proxy', 1)` and rely on `req.ip` for rate limiting to ensure the IP is correctly identified by the first trusted proxy.

## 2025-05-17 - [Sensitive Data Exposure via Automatic Population]
**Vulnerability:** Public exposure of sensitive user data (e.g., wallet balance) through API endpoints that populate user objects.
**Learning:** Relying on controller-level `select` exclusion is error-prone and doesn't scale as more endpoints are added. Authenticated fields like financial data should be protected at the model level.
**Prevention:** Use `select: false` in the Mongoose schema for sensitive fields. This makes them hidden by default across the entire application, requiring explicit opt-in via `.select('+field')` only when strictly necessary for specific business logic.

## 2025-05-18 - [Price Bypass and Unauthorized Content Access]
**Vulnerability:** Price bypass and unauthorized content access in coin transfer logic.
**Learning:** Unlocking content via external IDs (`messageId`, `packId`) without verifying their relationship to the recipient or their associated price allows attackers to acquire content for less than the set price or from unintended sellers.
**Prevention:** Always validate the integrity of the item being "purchased" by checking its price and ownership/origin before proceeding with any financial transaction or content unlock.
