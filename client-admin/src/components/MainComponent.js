import React, { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import Menu from "./MenuComponent";
import Home from "./HomeComponent";
import Category from "./CategoryComponent";
class Main extends Component {
  static contextType = MyContext;

  render() {
    if (this.context.token !== "") {
      return (
        <div className="body-admin">
          <Menu />
          <Routes>
            <Route
              path="/admin"
              element={<Navigate replace to="/admin/home" />}
            />
            <Route path="/admin/home" element={<Home />} />
            <Route path="/admin/category" element={<Category />} />
          </Routes>
        </div>
      );
    }
    return <div />;
  }
}

export default Main;
