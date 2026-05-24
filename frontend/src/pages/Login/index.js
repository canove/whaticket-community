import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Button,
  CssBaseline,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { Eye, EyeOff, MessageSquareText as WhatsAppIcon } from "lucide-react";

import makeStyles from '@mui/styles/makeStyles';

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  "@global": {
    "html, body, #root": {
      height: "100%",
      margin: 0,
      padding: 0,
    },
  },

  "@keyframes fadeSlideUp": {
    from: { opacity: 0, transform: "translateY(24px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },

  "@keyframes floatA": {
    "0%, 100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
    "50%": { transform: "translateY(-18px) rotate(2deg) scale(1.01)" },
  },

  "@keyframes floatB": {
    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
    "40%": { transform: "translateY(12px) rotate(-1.5deg)" },
    "70%": { transform: "translateY(-8px) rotate(1deg)" },
  },

  "@keyframes blink": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.3 },
  },

  "@keyframes ripple": {
    "0%": { transform: "scale(1)", opacity: 0.3 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },

  root: {
    minHeight: "100vh",
    display: "flex",
  },

  // ─── Left panel ────────────────────────────────────────────────────────────
  leftPanel: {
    flex: "0 0 55%",
    background: "linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 40%, #BBF7D0 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px 64px",
    position: "relative",
    overflow: "hidden",
    [theme.breakpoints.down('lg')]: {
      display: "none",
    },
  },

  // Decorative organic shapes
  shape1: {
    position: "absolute",
    width: 340,
    height: 240,
    borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
    background: "rgba(37, 211, 102, 0.12)",
    border: "1.5px solid rgba(37, 211, 102, 0.2)",
    top: "8%",
    right: "-60px",
    animation: "$floatA 10s ease-in-out infinite",
  },

  shape2: {
    position: "absolute",
    width: 220,
    height: 170,
    borderRadius: "45% 55% 45% 55% / 55% 45% 55% 45%",
    background: "rgba(21, 128, 61, 0.07)",
    border: "1px solid rgba(21, 128, 61, 0.14)",
    bottom: "18%",
    left: "24px",
    animation: "$floatB 13s ease-in-out infinite",
  },

  shape3: {
    position: "absolute",
    width: 130,
    height: 100,
    borderRadius: "50% 50% 50% 50% / 60% 40% 60% 40%",
    background: "rgba(37, 211, 102, 0.08)",
    border: "1px solid rgba(37, 211, 102, 0.15)",
    top: "50%",
    right: "22%",
    animation: "$floatA 8s ease-in-out infinite 1.5s",
  },

  // Ripple behind the brand mark
  brandRipple: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "2px solid rgba(37,211,102,0.3)",
    top: 47,
    left: 63,
    animation: "$ripple 3s ease-out infinite",
  },

  // brand
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
    position: "relative",
  },

  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(37,211,102,0.3)",
    "& svg": {
      color: "#fff",
      fontSize: 24,
    },
  },

  brandName: {
    color: "#1C1917",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "-0.4px",
  },

  // hero
  heroArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
    paddingBottom: 16,
  },

  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(37,211,102,0.12)",
    border: "1px solid rgba(37,211,102,0.28)",
    borderRadius: 100,
    padding: "5px 13px",
    marginBottom: 26,
    width: "fit-content",
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16A34A",
    animation: "$blink 2s ease-in-out infinite",
  },

  liveBadgeText: {
    color: "#15803D",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  heroTitle: {
    color: "#1C1917",
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 52,
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    marginBottom: 20,
    marginTop: 0,
    "& em": {
      fontStyle: "italic",
      fontWeight: 400,
      color: "#15803D",
    },
  },

  heroSub: {
    color: "#57534E",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 1.7,
    maxWidth: 360,
    margin: 0,
  },

  // footer stats
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    zIndex: 1,
    position: "relative",
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  statNum: {
    color: "#1C1917",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 22,
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },

  statLabel: {
    color: "#78716C",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    lineHeight: 1,
  },

  statSep: {
    width: 1,
    height: 28,
    background: "#D6D3D1",
  },

  // ─── Right panel ───────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAF9",
    padding: "48px 40px",
    [theme.breakpoints.down('md')]: {
      padding: "36px 24px",
    },
  },

  formBox: {
    width: "100%",
    maxWidth: 380,
    animation: "$fadeSlideUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
  },

  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
    [theme.breakpoints.down('lg')]: {
      display: "flex",
    },
  },

  mobileLogo: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#25D366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      color: "#fff",
      fontSize: 20,
    },
  },

  mobileBrandName: {
    color: "#1C1917",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "-0.4px",
  },

  formHead: {
    marginBottom: 28,
  },

  eyebrow: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "#78716C",
    marginBottom: 6,
  },

  formTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 32,
    color: "#1C1917",
    letterSpacing: "-0.8px",
    lineHeight: 1.15,
    margin: 0,
  },

  field: {
    marginBottom: 14,
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor: "#ffffff",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 15,
      transition: "box-shadow 0.2s ease",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#D6D3D1",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#A8A29E",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(37,211,102,0.1)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#25D366",
          borderWidth: 1.5,
        },
      },
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: "#78716C",
      "&.Mui-focused": {
        color: "#16A34A",
      },
    },
  },

  submitBtn: {
    marginTop: 20,
    marginBottom: 18,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#25D366",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 15,
    boxShadow: "0 4px 16px rgba(37,211,102,0.25)",
    transition: "all 0.2s ease",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#1DAB57",
      boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
      boxShadow: "0 2px 8px rgba(37,211,102,0.2)",
    },
  },

  registerRow: {
    textAlign: "center",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 13.5,
    color: "#78716C",
  },

  registerLink: {
    color: "#16A34A",
    fontWeight: 600,
    textDecoration: "none",
    marginLeft: 4,
    "&:hover": {
      textDecoration: "underline",
    },
  },

  privacyRow: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#A8A29E",
  },

  privacyLink: {
    color: "#78716C",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "underline",
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    "&:hover": {
      color: "#16A34A",
    },
  },

  dialogTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 22,
    color: "#1C1917",
    letterSpacing: "-0.5px",
  },

  dialogContent: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    color: "#57534E",
    lineHeight: 1.75,
    "& h3": {
      color: "#1C1917",
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: 15,
      marginTop: 20,
      marginBottom: 6,
    },
    "& p": {
      margin: "0 0 12px",
    },
  },

  dialogBtn: {
    color: "#16A34A",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    textTransform: "none",
  },
}));

const Login = () => {
  const classes = useStyles();
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { handleLogin } = useContext(AuthContext);

  useEffect(() => {
    const id = "login-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handleChangeInput = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />

      {/* ── Left panel ── */}
      <div className={classes.leftPanel}>
        <div className={classes.shape1} />
        <div className={classes.shape2} />
        <div className={classes.shape3} />
        <div className={classes.brandRipple} />

        <div className={classes.brand}>
          <div className={classes.logoMark}>
            <WhatsAppIcon />
          </div>
          <span className={classes.brandName}>WhaTicket</span>
        </div>

        <div className={classes.heroArea}>
          <div className={classes.liveBadge}>
            <div className={classes.liveDot} />
            <span className={classes.liveBadgeText}>
              Plataforma de Vendas
            </span>
          </div>
          <h1 className={classes.heroTitle}>
            Venda mais,<br />
            atenda <em>melhor.</em>
          </h1>
          <p className={classes.heroSub}>
            Transforme conversas no WhatsApp em oportunidades de negócio.
            Gerencie leads, times e pipelines em um só lugar.
          </p>
        </div>

        <div className={classes.statsRow}>
          <div className={classes.stat}>
            <span className={classes.statNum}>∞</span>
            <span className={classes.statLabel}>Conversas</span>
          </div>
          <div className={classes.statSep} />
          <div className={classes.stat}>
            <span className={classes.statNum}>24/7</span>
            <span className={classes.statLabel}>Disponível</span>
          </div>
          <div className={classes.statSep} />
          <div className={classes.stat}>
            <span className={classes.statNum}>100%</span>
            <span className={classes.statLabel}>WhatsApp</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className={classes.rightPanel}>
        <div className={classes.formBox}>
          {/* Mobile brand */}
          <div className={classes.mobileBrand}>
            <div className={classes.mobileLogo}>
              <WhatsAppIcon />
            </div>
            <span className={classes.mobileBrandName}>WhaTicket</span>
          </div>

          <div className={classes.formHead}>
            <Typography className={classes.eyebrow}>
              Bem-vindo de volta 👋
            </Typography>
            <h2 className={classes.formTitle}>
              {i18n.t("login.title")}
            </h2>
          </div>

          <form noValidate onSubmit={handlSubmit}>
            <TextField
              className={classes.field}
              variant="outlined"
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
              className={classes.field}
              variant="outlined"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              className={classes.submitBtn}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
          </form>

          <div className={classes.registerRow}>
            Não tem uma conta?
            <Link
              component={RouterLink}
              to="/signup"
              className={classes.registerLink}
            >
              Cadastre-se
            </Link>
          </div>

          <div className={classes.privacyRow}>
            Ao entrar, você concorda com nossa{" "}
            <button
              className={classes.privacyLink}
              onClick={() => setPrivacyOpen(true)}
            >
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography className={classes.dialogTitle}>
            Política de Privacidade
          </Typography>
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          <p>
            Esta Política de Privacidade descreve como o <strong>WhaTicket</strong> coleta,
            usa e protege as informações dos usuários que utilizam nossa plataforma de
            atendimento e gestão de conversas via WhatsApp.
          </p>

          <h3>1. Informações coletadas</h3>
          <p>
            Coletamos dados necessários para o funcionamento da plataforma, incluindo:
            nome, endereço de e-mail, número de telefone dos contatos, conteúdo das
            mensagens trocadas nos canais de atendimento e dados de uso da ferramenta.
          </p>

          <h3>2. Uso das informações</h3>
          <p>
            As informações coletadas são utilizadas exclusivamente para a prestação do
            serviço contratado — gerenciamento de tickets, organização de filas de
            atendimento e histórico de conversas. Não vendemos nem compartilhamos dados
            pessoais com terceiros para fins comerciais.
          </p>

          <h3>3. Armazenamento e segurança</h3>
          <p>
            Os dados são armazenados em servidores seguros com acesso restrito. Adotamos
            boas práticas de segurança, incluindo autenticação com JWT, criptografia de
            senhas e comunicação via HTTPS.
          </p>

          <h3>4. Retenção de dados</h3>
          <p>
            Os dados são mantidos enquanto a conta estiver ativa. Após o encerramento,
            os dados poderão ser excluídos mediante solicitação formal ao administrador
            da plataforma.
          </p>

          <h3>5. Direitos do usuário</h3>
          <p>
            Você tem direito a acessar, corrigir ou solicitar a exclusão de seus dados
            pessoais a qualquer momento, entrando em contato com o responsável pela sua
            conta na plataforma.
          </p>

          <h3>6. Contato</h3>
          <p>
            Dúvidas sobre esta política podem ser enviadas ao administrador da sua
            organização ou ao suporte da plataforma.
          </p>

          <p style={{ marginTop: 16, color: "#A8A29E", fontSize: 12 }}>
            Última atualização: abril de 2025.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPrivacyOpen(false)}
            className={classes.dialogBtn}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
