## 2025-05-15 - [ReDoS and User Enumeration]
**Vulnerability:** Regex Injection (ReDoS) and User Enumeration via verbose error messages.
**Learning:** Using user-supplied input directly in `new RegExp()` without escaping allows for catastrophic backtracking attacks (ReDoS). Providing specific error messages for non-existent users vs. incorrect passwords allows attackers to map out registered emails.
**Prevention:** Always escape special characters in user-supplied strings before using them in regular expressions. Use uniform, generic error messages for all authentication failures.
