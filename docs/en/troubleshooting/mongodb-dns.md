# MongoDB DNS Connection Error

If the project encounters the following error:

```shell
Error: querySrv ECONNREFUSED _mongodb._tcp.shoppe.mobx4.mongodb.net
    at QueryReqWrap.onresolve [as oncomplete] (node:internal/dns/promises:295:17) {
  errno: undefined,
  code: 'ECONNREFUSED',
  syscall: 'querySrv',
  hostname: '_mongodb._tcp.shoppe.mobx4.mongodb.net'
}
```

This error may occur because the **DNS resolver** cannot resolve the MongoDB SRV record.

## Solution

Add the following code to the server (Or file `server/index.js` lines 3 - 4):

```js
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "1.0.0.1"]);
```

Where:

- `1.1.1.1`: Cloudflare DNS
- `1.0.0.1`: Backup Cloudflare DNS

Then restart the server.

> **Note:** The above code is only required if you face the `querySrv ECONNREFUSED` error when connecting to MongoDB using a connection string like `mongodb+srv://...`.

Read more:
- [StackOverflow: MongoDB connection failed error querySrv ECONNREFUSED](https://stackoverflow.com/questions/79875229/mongodb-connection-failed-error-querysrv-econnrefused)
- [MongoDB Community: Error: An error occurred during DNS resolution - request timed out](https://www.mongodb.com/community/forums/t/error-mongodb-error-an-error-occurred-during-dns-resolution-request-timed-out/239410/7)
