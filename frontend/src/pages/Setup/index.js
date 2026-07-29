import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import { LockOutlined, Visibility, VisibilityOff } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
  },
  subtitle: {
    marginTop: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Setup = () => {
  const classes = useStyles();
  const history = useHistory();
  const { handleLogin } = useContext(AuthContext);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Lock the wizard once an admin already exists — you can never create a 2nd.
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { data } = await api.get("/setup/status");
        if (!data.needsSetup) {
          history.push("/login");
          return;
        }
      } catch (err) {
        // ignore — allow the form to render
      }
      setChecking(false);
    };
    checkSetup();
  }, [history]);

  const handleChangeInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/setup", form);
      // auto-login with the just-created admin
      await handleLogin({ email: form.email, password: form.password });
    } catch (err) {
      toastError(err);
      setSaving(false);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Configuração inicial
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
          Bem-vindo! Crie a conta do administrador para começar a usar o sistema.
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChangeInput}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChangeInput}
            autoComplete="email"
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            id="password"
            value={form.password}
            onChange={handleChangeInput}
            helperText="Mínimo 5 caracteres"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(e => !e)}
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
            disabled={saving}
          >
            {saving ? "Criando..." : "Criar administrador e entrar"}
          </Button>
        </form>
      </div>
      <Box mt={8} />
    </Container>
  );
};

export default Setup;
