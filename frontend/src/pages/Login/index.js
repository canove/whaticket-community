import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../services/api";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Link,
  MenuItem
} from '@material-ui/core';

import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";

// const Copyright = () => {
// 	return (
// 		<Typography variant="body2" color="textSecondary" align="center">
// 			{"Copyleft "}
// 			<Link color="inherit" href="https://github.com/canove">
// 				Canove
// 			</Link>{" "}
// 			{new Date().getFullYear()}
// 			{"."}
// 		</Typography>
// 	);
// };

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Login = () => {
  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    })();
  }, []);
  const [companies, setCompanies] = useState([]);
  const classes = useStyles();
  const [user, setUser] = useState({ email: "", password: "", company: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);
  const [selectedCompany, setSelectedCompany] = useState("");

  const handleChangeInput = (e) => {
    setSelectedCompany(e.target.value);
    setUser({ ...user, [e.target.name]: e.target.value});
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <Container component="main" maxWidth="xs">
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
          select
          required
          fullWidth
          id="company"
          label={i18n.t("login.form.company")}
          name="company"
          value={selectedCompany}
          onChange={handleChangeInput}
          variant="outlined"
        >
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </TextField>
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
            autoFocus
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
          <Grid container>
            <Grid item>
              <Link
                href="#"
                variant="body2"
                component={RouterLink}
                to="/signup"
              >
                {i18n.t("login.buttons.register")}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>{/* <Copyright /> */}</Box>
    </Container>
  );
};

export default Login;
