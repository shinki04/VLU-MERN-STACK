import React, { Component } from "react";
import axios from "axios";
import MyContext from "../contexts/MyContext";

class Login extends Component {
  static contextType = MyContext; // using this.context to access global state

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
    };
  }

  // Event handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;

    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert("Please input username and password");
    }
  }

  // APIs
  apiLogin(account) {
    axios
      .post("/api/admin/login", account)
      .then((res) => {
        const result = res.data;
        if (result.success === true) {
          this.context.setToken(result.token);
          this.context.setUsername(account.username);
        } else {
          alert(result.message);
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("Server error occurred during login");
      });
  }

  render() {
    if (this.context.token === "") {
      return (
        <div className="align-valign-center">
          <h2 className="text-center">ADMIN LOGIN</h2>
          <form onSubmit={(e) => this.btnLoginClick(e)}>
            <table className="align-center">
              <tbody>
                <tr>
                  <td>Username</td>
                  <td>
                    <input
                      type="text"
                      value={this.state.txtUsername}
                      onChange={(e) => {
                        this.setState({ txtUsername: e.target.value });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td>
                    <input
                      type="password"
                      value={this.state.txtPassword}
                      onChange={(e) => {
                        this.setState({ txtPassword: e.target.value });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <input type="submit" value="LOGIN" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      );
    }
    return <div />;
  }
}

export default Login;
