import { useContext } from "react";
import { Route as RouterRoute, Navigate } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

interface RouteProps {
  element: JSX.Element;
  isPrivate?: boolean;
  [key: string]: any;
}

const Route = ({ element, isPrivate = false, ...rest }: RouteProps) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (loading) {
    return <BackdropLoading />;
  }

  if (isPrivate && !isAuth) {
    return <Navigate to="/login" state={{ from: rest.location }} replace />;
  }

  if (!isPrivate && isAuth) {
    return <Navigate to="/" state={{ from: rest.location }} replace />;
  }

  return <RouterRoute {...rest} element={element} />;
};

export default Route;
