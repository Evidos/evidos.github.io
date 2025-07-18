---
title: Introduction
---

## OpenAPI Specification

The Signhost REST API is described using the [OpenAPI Specification](https://www.openapis.org/). This specification is available in YAML format and can be used to generate client libraries, documentation, and other tools.

**Download**: <a href="/openapi.yaml" target="_blank">openapi.yaml</a>

### Server Address

The REST API Base URL is: `https://api.signhost.com`

### Security

We require that all API requests are done over HTTPS. See the [Authentication](../features/authentication.md) page for details on API authentication.

### Return codes

The REST API uses standard [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status).

In short this means that any status code in the range of:

- **2xx** - your request was successful
- **4xx** - there was an error in your request. You should not retry the request until you have corrected the error
- **5xx** - there was an internal error in Signhost. You may retry this request at a later time. If you implement a retry policy you should use a backoff policy.

### Date Time Formats

JSON results which contain a date, time or datetime property are formatted according to [ISO8601](https://www.iso.org/iso/iso8601). A short explanation of the format is available at [w3.org - Date and Time Formats](https://www.w3.org/TR/NOTE-datetime).

## Libraries and demos

There are a few client libraries and demos available to make connecting to our API easier.

### Signhost Libraries

These libraries are built and maintained by Signhost:

- [C# .Net Client Library](https://github.com/Evidos/SignhostClientLibrary)
- [C# .Net Client Library (Polly)](https://github.com/Evidos/SignhostClientLibrary.polly)

### Community Libraries

These libraries are built and maintained by the community:

- [Python Client Library](https://github.com/foarsitter/signhost-api-python-client)

### Postman Workspace

Check out our public [Postman](https://www.postman.com/) workspace to make a quick start with testing - [Postman workspace](https://www.postman.com/dark-capsule-755015/signhost-api-public/overview).
