# MongoDB Authentication Failed Error

If your project encounters the following error during startup:

```shell
MongoServerError: bad auth : Authentication failed.
    at Connection.onMessage (<......>)
    ...
```

This error occurs when the MongoDB server rejects the credentials (Username or Password) provided in the connection string.

---

## Common Causes

1. **Incorrect Username or Password:** The MongoDB Atlas password or username configured in the `.env` file does not match the Database User created on the MongoDB Atlas dashboard.
2. **Special Characters in Password:** This is the most common cause. If your password contains special characters such as `@`, `:`, `/`, `+`, `?`, `#`, `&`... then when interpolating the connection string:
   ```js
   const uri = `mongodb+srv://${MyConstants.DB_USER}:${MyConstants.DB_PASS}@${MyConstants.DB_SERVER}/${MyConstants.DB_DATABASE}`;
   ```
   The URL parser will misinterpret the structure, leading to authentication or parsing errors.
3. **Server Not Restarted:** You updated the `.env` file but did not restart the Node.js server, so the application still uses the old, incorrect configuration.

---

## Solutions

### 1. Check Database User on MongoDB Atlas
Ensure that you have created a **Database User** (not the web login account for MongoDB Atlas) with proper permissions:
- Go to MongoDB Atlas -> **Database Access** under the Security section.
- Verify that a user matches the `DB_USER` in your `.env`.
- Ensure the user has the **Read and write to any database** role (or readWrite permissions on your specific database).

### 2. URL-encode Special Characters in Password
If your password contains special characters, you must convert them to their URL-encoded format.

**Common characters conversion table:**
| Character | URL Encoded |
| :---: | :---: |
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `+` | `%2B` |
| `?` | `%3F` |
| `#` | `%23` |
| `&` | `%26` |

*Example:* If your password is `my@pass:123`, update it in the `.env` file as:
```text
DB_PASS=my%40pass%3A123
```

> **Tip:** Alternatively, you can create a new Database User on MongoDB Atlas with a password containing only letters and numbers (no special characters) to avoid manual URL encoding.

### 3. Restart the Node.js Server
After updating the `.env` file, stop the running server by pressing `Ctrl + C` and start it again:
```bash
pnpm dev
# or
npm run dev
```
