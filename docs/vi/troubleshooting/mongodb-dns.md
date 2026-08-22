# MongoDB DNS Connection Error

Nếu project gặp lỗi:

```shell
Error: querySrv ECONNREFUSED _mongodb._tcp.<cluster-name>.mongodb.net
    at QueryReqWrap.onresolve [as oncomplete] (node:internal/dns/promises:295:17) {
  errno: undefined,
  code: 'ECONNREFUSED',
  syscall: 'querySrv',
  hostname: '_mongodb._tcp.<cluster-name>.mongodb.net'
}
```

Lỗi này có thể xảy ra do **DNS resolver** không thể resolve được MongoDB SRV record.

## Cách khắc phục

Thêm đoạn code sau vào `server` (Hoặc file `server/index.js`):


```js
import dns from "node:dns/promises"; // [!code ++]
dns.setServers(["1.1.1.1", "1.0.0.1"]); // [!code ++]

const express = require("express");
const bodyParser = require("body-parser");
```

Trong đó:

- `1.1.1.1`: Cloudflare DNS
- `1.0.0.1`: Cloudflare DNS dự phòng

Sau đó khởi động lại server.

> **Lưu ý:** Đoạn code trên chỉ cần sử dụng nếu bạn gặp lỗi `querySrv ECONNREFUSED` khi kết nối MongoDB bằng connection string `mongodb+srv://...`.

Đọc thêm:
- [StackOverflow: MongoDB connection failed error querySrv ECONNREFUSED](https://stackoverflow.com/questions/79875229/mongodb-connection-failed-error-querysrv-econnrefused)
- [MongoDB Community: Error: An error occurred during DNS resolution - request timed out](https://www.mongodb.com/community/forums/t/error-mongodb-error-an-error-occurred-during-dns-resolution-request-timed-out/239410/7)
