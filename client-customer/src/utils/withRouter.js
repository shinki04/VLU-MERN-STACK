import { useParams, useNavigate } from "react-router-dom";
import React from "react";

function withRouter(Component) {
  return (props) => (
    <Component {...props} params={useParams()} navigate={useNavigate()} />
  );
}

export default withRouter;
