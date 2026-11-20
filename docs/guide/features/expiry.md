---
title: Expiry
---

A transaction expires when either of two moments passes, whichever comes first:

- **Transaction expiry:** `DaysToExpire` days after the transaction was created (1 to 90).
- **Signer expiry:** the `Expires` date and time of a signer who has not signed or rejected yet.

A transaction needs all of its signers to sign. When one signer reaches their `Expires` without having signed, the **whole transaction** expires, not only that signer's part. A signer who has already signed or rejected can no longer expire: their `Expires` has no effect anymore.

A transaction that already ended (signed, rejected, cancelled, expired or failed) never expires.

### What happens on expiry

- Nobody can sign anymore. A signer who opens the sign link sees that the transaction has expired, also a signer who has not reached their own expiry.
- The sender receives an expiry email when `SendEmailNotifications` is `true`.
- A postback with status **50** (Expired) is sent. See [Postbacks](./postbacks) and [Status](./status).
- Reminders stop.

The status changes to **50** shortly after the expiry moment, when the expiry job has run. Signing is refused from the expiry moment onward.

When a signer is in the signing flow while the transaction expires, signing is refused and the signer is told that the transaction has expired.

### Rules for signer `Expires`

- It must be in the future and at most 90 days ahead.
- It only applies while the signer has not signed or rejected.
- It must not be later than the transaction expiry. A later value is rejected with a `400` and the message `The expiry date should not be later than the transaction expiry (N days from now).`
- A signer without `Expires` follows the transaction expiry.
- `DaysToRemind` must be lower than the days until the signer's `Expires`.

### Example

A transaction is created with `DaysToExpire: 30`. Signer A has `Expires` in 3 days, signer B has no `Expires`.

- Day 3, signer A has not signed: signer A's expiry passes and the whole transaction expires. Signer B can no longer sign and a status **50** postback is sent.
- Day 2, signer A has signed: nothing happens on day 3. The transaction stays open for signer B until day 30.

### Dates in emails

The availability date in the sign request email is the earlier of the transaction expiry and that signer's own `Expires`. Two signers can therefore see different dates for the same transaction.
