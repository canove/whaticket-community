import React, { useState, useContext} from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Paper,
} from '@material-ui/core';
import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";
import background from "../../assets/imgbor1950.webp";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  login: {
    padding: 15,
    borderRadius: 10,
    display: "flex",

  },
  fundo: {
    paddingTop: 100,
    width: "100%",
    height: "100%",

  },
}));

const Login = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [user, setUser] = useState({ email: "", password: "", company: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
      handleLogin(user);
  };
  return (
    <div
      className={classes.fundo}
      style={{ backgroundImage: `url(${background})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover" }}
      >
        <Container component="main" maxWidth="xs">
          <div>
            <Paper elevation={5} className={classes.login}>
              <CssBaseline />
              <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                  <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">
                  {i18n.t("login.title")}
                </Typography>
                <form className={classes.form} noValidate onSubmit={handlSubmit}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="company"
                    label={i18n.t("login.form.company")}
                    name="company"
                    value={user.company}
                    onChange={handleChangeInput}
                    autoComplete="company"
                    autoFocus
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={i18n.t("login.form.email")}
                    name="email"
                    value={user.email}
                    onChange={handleChangeInput}
                    autoComplete="email"
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={i18n.t("login.form.password")}
                    id="password"
                    value={user.password}
                    onChange={handleChangeInput}
                    autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((e) => !e)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                  >
                    {i18n.t("login.buttons.submit")}
                  </Button>
                </form>
              </div>
            </Paper>
          </div>
        </Container>
    </div>
  );
};

export default Login;
