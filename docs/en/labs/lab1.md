# Lab 01: MERN Stack - Shopping Online (Preparation & Setting Up)

:::warning NOTE
To ensure the entire lab series runs stably, please start the programs in the following order:

Server `(port: 3000)` → Client Admin `(port: 3001)` → Client Customer `(port: 3002)`
:::

## Preparation

### MongoDB Atlas
- Sign up for an account on MongoDB Atlas: [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
- **Create Project & Database:**
  - Menu **Projects** => **New Project**
    - Project name: `<project_name>`
  - Menu **Database** => **Create a free database**
    - Cloud provider & Region: AWS + Singapore
    - Cluster name: `<cluster>`
     [[IMAGE]]
- **Database Access:**
  - Menu **Database Access** => **Create a Database User**
    - Authentication method: Username and Password
    - Password authentication: Enter `<db_user>` and `<db_pass>`. You can change `<db_user>` and `<db_pass>` to whatever is convenient and easy to remember for you.
    ::: tip TIP
    For convenience in subsequent configuration and database connection steps, you should save the created **username** and **password**.
    :::
     [[IMAGE 3]]
    - Select `Create Database User` to create the database management account.
     [[IMAGE 4]]
    - Press `Choose a connection method` to select how to connect to the database.
    ::: details DETAILS {open}
      You can choose the connection method that suits your purpose:
      - **Driver:** Used in development environments, suitable for connecting from a backend such as Node.js, Go, etc.
      - **Compass:** Used when connecting through MongoDB Compass.
      - **Shell:** Used when wanting to connect through a CLI like CMD or PowerShell.
      - **...:** Other connection methods depending on your needs.
    :::
    [[IMAGE 5]]
- **Network Access:**
  - Menu **Network Access** => **Add an IP address**
    - Access list entry: `0.0.0.0/0` (allow access from anywhere).
    ::: warning WARNING
      `0.0.0.0/0` allows access from any IP address. This configuration is only used within the scope of this lab for convenience.
      Do not use this configuration in production environments.
    :::
    [[IMAGE 6 7]]

- **MongoDB Compass:**
  ::: details DETAILS {open}
    MongoDB Compass is an optional tool. If your device has resource limitations, you can skip this step and perform database operations directly on the MongoDB Atlas website.
  :::
  - Download and install MongoDB Compass (GUI) from: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
  - Create a new connection and copy the connection string:
    `mongodb+srv://<db_user>:<db_pass>@<cluster>.mongodb.net/test`
  ::: details DETAILS
  If you want to learn more about how to connect MongoDB Atlas with MongoDB Compass using a **connection string**, you can refer to [detailed guide at GeeksforGeeks](https://www.geeksforgeeks.org/mongodb/connect-mongodb-atlas-cluster-with-mongodb-compass/).
  :::
  - Create database: `shoppingonline`
    - Create collection: `admins` => Import JSON file from [admins.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/admins.json)
    - Create collection: `categories` => Import JSON file from [categories.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/categories.json)
    - Create collection: `products` => Import JSON file from [products.json](https://github.com/tsonkk/shoppingonline-resources/blob/main/mongodb/products.json)

### Hotmail
  ::: warning WARNING
  You can use Gmail as an alternative because Hotmail is no longer supported by Microsoft. If you encounter errors, please see [Common Errors when Configuring Email](/en/troubleshooting/hotmail.md).
  :::
- Sign up for an account from Microsoft: [https://signup.live.com](https://signup.live.com)
  - New email: `<email_user>@hotmail.com`
  - Create password: `<email_pass>`
- Security tab: turn off two-step verification.
- Outlook application: view the welcome email.
- SMTP settings from: [Microsoft Support](https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398)
  - Server: `smtp.office365.com`
  - Port: `587`
  - Encryption: `STARTTLS`
- Test SMTP server using terminal:
  ```bash
  $ telnet smtp.office365.com 587
  ```

---

## MERN Stack

### Installation

#### Required Tools

##### NodeJS
- Verify version:
  ```bash
  $ node --version
  $ npm --version
  ```
- If not installed, download and install NodeJS from: [https://nodejs.org/en/download](https://nodejs.org/en/download)
- After installation is complete, verify the version again:
  ```bash
  $ node --version
  $ npm --version
  ```

##### Nodemon Tool
- Install Nodemon tool globally (use `sudo` command for MacOS):
  ```bash
  $ npm install nodemon --global
  $ nodemon --version
  ```

##### ReactJS
- Install `create-react-app` tool globally (use `sudo` command for MacOS):
  ```bash
  $ npm install create-react-app --global
  $ create-react-app --version
  ```

##### Visual Studio Code IDE
- Download and install Visual Studio Code from: [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

#### Projects Structure

Project folder structure **<u>(view only, creating folders will be guided in the next steps)</u>**:

```text
|-- projectname
    |-- server
    |-- client-admin
    |-- client-customer
```

##### Project Server
- Create server project:

<div class="cmd-server">

  ```bash
  npm init -y
  ```

</div>

- Download required libraries:

<div class="cmd-server">

  ```bash
  $ npm install express body-parser --save
  ```

</div>

After downloading successfully, `server/package.json` file will update `dependencies` and show the 2 libraries with their versions.

- Create `server/index.js` file:

  ```javascript
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
  // middlewares
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  // apis
  app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from server!' });
  });
  ```

- Start server:
<div class="cmd-server">

  ```bash
  nodemon index.js
  ```
</div>

- Test with Postman: (GET) `http://localhost:3000/hello`

Response result:
```json
{
  "message": "Hello from server!"
}
```

##### Project Client-admin
- Create client-admin project:
<div class="project-name">

  ```bash
  npx create-react-app client-admin
  ```
  </div>

- Update `client-admin/package.json` file:
  ```json
  {
    ...
    "homepage": "/admin",
    "proxy": "http://localhost:3000"
  }
  ```

- Download required libraries:
<div class="client-admin">

```bash
npm install axios --save
```

</div>

- Update `client-admin/src/App.js` file:
  ```javascript
  // CLI: npm install axios --save
  import axios from 'axios';
  import React, { Component } from 'react';

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        message: 'Loading...'
      };
    }
    render() {
      return (
        <div>
          <h2>Admin page</h2>
          <p>{this.state.message}</p>
        </div>
      );
    }
    componentDidMount() {
      axios.get('/hello').then((res) => {
        const result = res.data;
        this.setState({ message: result.message });
      });
    }
  }
  export default App;
  ```
- Start client-admin:

<div class="client-admin">

  ```bash
  npm start
  ```

</div>

- Test on browser: `http://localhost:3001/admin`

##### Project Client-customer
- Create client-customer project:

<div class="project-name">


  ```bash
  npx create-react-app client-customer
  ```
  </div>

- Update `client-customer/package.json` file:
  ```json
  {
    ...
    "homepage": "/",
    "proxy": "http://localhost:3000"
  }
  ```

- Download required libraries:
<div class="client-customer">

```bash
npm install axios --save
```

</div>

- Update `client-customer/src/App.js` file:
  ```javascript
  // CLI: npm install axios --save
  import axios from 'axios';
  import React, { Component } from 'react';

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        message: 'Loading...'
      };
    }
    render() {
      return (
        <div>
          <h2>Customer page</h2>
          <p>{this.state.message}</p>
        </div>
      );
    }
    componentDidMount() {
      axios.get('/hello').then((res) => {
        const result = res.data;
        this.setState({ message: result.message });
      });
    }
  }
  export default App;
  ```
- Start client-customer:
<div class="client-customer">

  ```bash
  npm start
  ```
  </div>

- Test on browser: `http://localhost:3002`
