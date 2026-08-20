import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "Loading...",
    };
  }

  componentDidMount() {
    axios
      .get("/hello")
      .then((res) => {
        const result = res.data;
        this.setState({ message: result.message });
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        this.setState({ message: "Failed to load message." });
      });
  }

  render() {
    return (
      <div>
        <h2>Customer page</h2>
        <p>{this.state.message}</p>
      </div>
    );
  }
}

export default App;
