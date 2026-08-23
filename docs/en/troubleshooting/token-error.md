# Auth Token Errors

When working with APIs that require authentication (secured endpoints in the Admin or Customer section), you might encounter token validation errors related to JWT (JSON Web Token) from the server:
- `"Auth token is not supplied"` (No authentication token provided)
- `"Token is not valid"` (Token is invalid or expired)

Below are the detailed causes and solutions for each case.

---

## 1. Error: "Auth token is not supplied"

### Cause
This error occurs when the API endpoint requires a JWT authentication token in the request headers to verify access, but your request did not include it.

In `server/utils/JwtUtil.js`, the `checkToken` middleware searches for the token in the `x-access-token` or `authorization` headers:
```javascript
let token = req.headers["x-access-token"] || req.headers["authorization"];
```
If not found, the server responds with:
```json
{
  "success": false,
  "message": "Auth token is not supplied"
}
```

### Solution

#### A. When testing with Postman:
Make sure you have added the authentication header in the **Headers** tab of Postman (not the *Params* or *Body tab*):
- **Key:** `x-access-token`
- **Value:** `<token_received_after_successful_login>`
*(Example: copy the full JWT token string from the login response and paste it here)*

Or if using the standard `Authorization` header:
- **Key:** `Authorization`
- **Value:** `Bearer <token>`

##### Example of retrieving and using `<admin-token>` via Postman:

1. **Step 1: Perform Login to get the token:**
   - Create a new request in Postman:
     - **Method:** `POST`
     - **URL:** `http://localhost:3000/api/admin/login`
     - **Body** -> Select `raw` -> Select `JSON` format:
       ```json
       {
         "username": "admin",
         "password": "123"
       }
       ```
     - Click **Send**. The response returned from the server will look like this:
       ```json
       {
         "success": true,
         "message": "Authentication successful",
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
       }
       ```
     - **Copy** the entire character string inside the `"token"` field.

2. **Step 2: Use the token to call secured APIs:**
   - Create a request to call the API you want to test (e.g., get categories `GET http://localhost:3000/api/admin/categories`):
     - Open the **Headers** tab of that request.
     - Add a new config line:
       - **Key:** `x-access-token`
       - **Value:** *Paste the token string copied in Step 1 here.*
     - Click **Send** to call the API.

::: warning NOTE ON ACCOUNT PERMISSIONS (ADMIN vs CUSTOMER)
- API endpoints for **Admin** (starting with `/api/admin/...`) require a token generated from an Admin account (log in via `/api/admin/login`).
- API endpoints for **Customer** (starting with `/api/customer/...`) require a token generated from a Customer account (log in via `/api/customer/login`).
- Ensure that you use the correct account type and token when testing APIs in Postman. Using the wrong token type (e.g., using a Customer token to access Admin APIs) will result in authorization errors or failure to execute the desired business logic.
:::

#### B. In Client (React) code:
Verify that your API requests attach the token in the Axios `headers` configuration:
```javascript
const config = { headers: { "x-access-token": this.context.token } };
axios.get('/api/admin/categories', config)
```
If `this.context.token` is empty (due to not logging in yet, or state loss after reloading the page), the server will throw this error. Ensure that the login state is properly maintained.

---

## 2. Error: "Token is not valid"

### Cause
This error occurs when the server receives the token, but verification using the secret key fails. The main reasons are:
1. **Expired Token:** The token's lifespan has exceeded the limit set in `JWT_EXPIRES` (e.g., token expires after 1 day or a few hours).
2. **JWT Secret Mismatch:** The `JWT_SECRET` key on the server has changed, or a server restart generated a new random key, making previously generated tokens invalid.
3. **Invalid Token Format:** The token was copied incorrectly (missing characters, extra spaces) or modified.

### Solution

#### A. Re-login to get a new token:
Since the token might have expired, the simplest solution is to log in again via the user interface or call the Login API to obtain a new token.

#### B. Check `JWT_SECRET` and `.env` settings:
Ensure that `JWT_SECRET` and `JWT_EXPIRES` are configured consistently.
In the `server` directory's `.env` file:
```text
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=86400000 # Example: 24 hours in milliseconds
```
> **Note:** Always restart the Node.js server after updating the `.env` file for changes to take effect.

#### C. Handle token errors gracefully in Client code:
To prevent application crashes when rendering data, check the API response on the client side and log the user out if a token error occurs.

Example React snippet:
```javascript
axios.get('/api/admin/categories', config)
  .then((res) => {
    const result = res.data;
    if (result.success === false && (result.message === 'Token is not valid' || result.message === 'Auth token is not supplied')) {
      // Clear token and prompt to re-login
      this.context.setToken('');
      this.context.setUsername('');
      alert('Your session has expired. Please log in again.');
    } else {
      this.setState({ categories: result });
    }
  });
```
