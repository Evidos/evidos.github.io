---
title: Authentication
---

To authenticate your requests, you must add two HTTP headers to every request.

| Header Name     | Header Value               | Description     |
| --------------- | -------------------------- | --------------- |
| `Application`   | `APPKey {appkey token}`    | Application Key |
| `Authorization` | `APIKey {your user token}` | User Token      |

#### Application Key (APPKey)

The application key identifies your application you are integrating from. You can generate your APPKey on the [ApplicationKey](https://portal.signhost.com/ApplicationKey) page of the Signhost portal.

#### User Token (APIKey)

The User Token identifies the user that signing transactions will originate from. You can generate your User Token on the [Settings](https://portal.signhost.com/v2/settings/tokens) page of the Signhost Portal.

:::warning
Note that both your User Token and Application Key will only be shown once when you generate them.
We cannot retrieve these keys for you, as they are encrypted on our servers.
If you lose them, you will need to generate new keys.
:::

Below is an HTTP request header example:

```
Authorization: APIKey Al2CERwYbT.aVuHxoOfNAIxTdg7aMfScMjSEWqiA1K4
Application: APPKey RgdrkIBzxz0bd4FG Ez03pWmSjFo5tXjzIaxRUOTyYjIwxoug
Content-Type: application/json
Accept: application/json
Connection: keep-alive
```
