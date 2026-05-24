import React, { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import {
  Button,
  CssBaseline,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { Eye as Visibility, EyeOff as VisibilityOff, MessageSquareText as WhatsAppIcon } from "lucide-react";
import makeStyles from '@mui/styles/makeStyles';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  "@global": {
    "html, body, #root": { height: "100%", margin: 0, padding: 0 },
  },
  "@keyframes fadeSlideUp": {
    from: { opacity: 0, transform: "translateY(28px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  root: {
    minHeight: "100vh",
    display: "flex",
  },
  leftPanel: {
    flex: "0 0 58%",
    background: "linear-gradient(150deg, #081320 0%, #0B1E38 45%, #0A2B4A 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "52px 72px",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down('lg')]: { display: "none" },
  },
  brand: { display: "flex", alignItems: "center", gap: 12, zIndex: 1, position: "relative" },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
    "& svg": { color: "#fff", fontSize: 24 },
  },
  brandName: {
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "-0.5px",
  },
  heroArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
    paddingBottom: 24,
  },
  heroTitle: {
    color: "#ffffff",
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 54,
    lineHeight: 1.08,
    letterSpacing: "-1.5px",
    marginBottom: 22,
    marginTop: 0,
  },
  heroSub: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 360,
    margin: 0,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    padding: "48px 40px",
    [theme.breakpoints.down('md')]: { padding: "36px 24px" },
  },
  formBox: {
    width: "100%",
    maxWidth: 400,
    animation: "$fadeSlideUp 0.5s ease-out both",
  },
  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
    [theme.breakpoints.down('lg')]: { display: "flex" },
  },
  mobileLogo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    background: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": { color: "#fff", fontSize: 20 },
  },
  mobileBrandName: {
    color: "#0A0F1E",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "-0.4px",
  },
  formHead: { marginBottom: 32 },
  eyebrow: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13.5,
    fontWeight: 500,
    color: "#9BA3B0",
    marginBottom: 8,
    letterSpacing: "0.2px",
  },
  formTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 34,
    color: "#0A0F1E",
    letterSpacing: "-1px",
    lineHeight: 1.1,
    margin: 0,
  },
  field: {
    marginBottom: 14,
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      backgroundColor: "#ffffff",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 15,
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#25D366" },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(37,211,102,0.12)",
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#25D366", borderWidth: 1.5 },
      },
    },
    "& .MuiInputLabel-outlined.Mui-focused": { color: "#25D366" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E9EF" },
  },
  submitBtn: {
    marginTop: 22,
    marginBottom: 18,
    height: 50,
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366 0%, #1DAB57 100%)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 15.5,
    letterSpacing: "0.2px",
    boxShadow: "0 6px 20px rgba(37,211,102,0.28)",
    transition: "all 0.2s ease",
    textTransform: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #2BDC6E 0%, #20B85E 100%)",
      boxShadow: "0 10px 28px rgba(37,211,102,0.38)",
    },
  },
  loginRow: {
    textAlign: "center",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13.5,
    color: "#9BA3B0",
  },
  loginLink: {
    color: "#1DAB57",
    fontWeight: 600,
    textDecoration: "none",
    marginLeft: 4,
    "&:hover": { textDecoration: "underline" },
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const SignUp = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (values) => {
    try {
      await api.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      navigate("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <CssBaseline />

      <div className={classes.leftPanel}>
        <div className={classes.brand}>
          <div className={classes.logoMark}><WhatsAppIcon size={24} /></div>
          <span className={classes.brandName}>WhaTicket</span>
        </div>
        <div className={classes.heroArea}>
          <h1 className={classes.heroTitle}>
            Crie sua<br />conta agora.
          </h1>
          <p className={classes.heroSub}>
            Comece a gerenciar seu atendimento via WhatsApp em minutos.
          </p>
        </div>
        <div />
      </div>

      <div className={classes.rightPanel}>
        <div className={classes.formBox}>
          <div className={classes.mobileBrand}>
            <div className={classes.mobileLogo}><WhatsAppIcon size={20} /></div>
            <span className={classes.mobileBrandName}>WhaTicket</span>
          </div>

          <div className={classes.formHead}>
            <Typography className={classes.eyebrow}>Novo por aqui? 👋</Typography>
            <h2 className={classes.formTitle}>{i18n.t("signup.title")}</h2>
          </div>

          <Formik
            initialValues={{ name: "", email: "", password: "" }}
            enableReinitialize
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                handleSignUp(values);
                actions.setSubmitting(false);
              }, 400);
            }}
          >
            {({ touched, errors }) => (
              <Form>
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.field}
                      autoComplete="name"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      fullWidth
                      label={i18n.t("signup.form.name")}
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.field}
                      variant="outlined"
                      fullWidth
                      label={i18n.t("signup.form.email")}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      className={classes.field}
                      variant="outlined"
                      fullWidth
                      name="password"
                      autoComplete="current-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      label={i18n.t("signup.form.password")}
                      type={showPassword ? "text" : "password"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((v) => !v)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff size={18} /> : <Visibility size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disableElevation
                  className={classes.submitBtn}
                >
                  {i18n.t("signup.buttons.submit")}
                </Button>
              </Form>
            )}
          </Formik>

          <div className={classes.loginRow}>
            Já tem uma conta?
            <Link component={RouterLink} to="/login" className={classes.loginLink}>
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
