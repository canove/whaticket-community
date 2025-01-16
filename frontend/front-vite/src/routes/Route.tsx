import { useContext } from "react";
import { Route as RouterRoute, Navigate } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

import { ComponentType } from "react";

interface RouteProps {
  component: ComponentType<any>;
  isPrivate?: boolean;
  [key: string]: any;
}

const Route = ({
  component: Component,
  isPrivate = false,
  ...rest
}: RouteProps) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (!isAuth && isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Navigate to="/login" state={{ from: rest.location }} />
      </>
    );
  }

  if (isAuth && !isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Navigate to="/" state={{ from: rest.location }} />;
      </>
    );
  }

  return (
    <>
      {loading && <BackdropLoading />}
      <RouterRoute {...rest} element={<Component />} />
    </>
  );
};

export default Route;
