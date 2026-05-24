import React, { useState, useEffect } from "react";
import openSocket from "../../services/socket-io";

import makeStyles from '@mui/styles/makeStyles';
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import { Eye as Visibility, EyeOff as VisibilityOff } from "lucide-react";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(() => ({
  root: {
    padding: "28px 24px",
    backgroundColor: "#F7F8FA",
    minHeight: "100%",
  },
  pageTitle: {
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: 700,
    fontSize: 28,
    color: "#0A0F1E",
    letterSpacing: "-0.5px",
    margin: "0 0 24px",
  },
  container: {
    maxWidth: 560,
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #E5E9EF",
    borderRadius: 14,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "#0A0F1E",
    margin: 0,
    flex: 1,
  },
  select: {
    marginLeft: "auto",
    minWidth: 140,
    "& .MuiOutlinedInput-root": {
      borderRadius: 9,
    },
  },

  apiKeyCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #E5E9EF",
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  apiKeyHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  apiKeyLabel: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "#0A0F1E",
    margin: 0,
    flex: 1,
  },

  apiKeyDesc: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 12,
    color: "#9BA3B0",
    margin: 0,
  },

  apiKeyField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 11,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 13.5,
      "& fieldset": { borderColor: "#E5E9EF" },
      "&:hover fieldset": { borderColor: "#25D366" },
      "&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: 13.5,
      color: "#9BA3B0",
    },
    "& .MuiInputLabel-outlined.Mui-focused": { color: "#25D366" },
  },

  saveBtn: {
    alignSelf: "flex-end",
    borderRadius: 11,
    background: "linear-gradient(135deg, #25D366, #1DAB57)",
    color: "#ffffff",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    textTransform: "none",
    height: 36,
    padding: "0 20px",
    boxShadow: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #1DAB57, #178A45)",
      boxShadow: "none",
    },
  },
}));

const Settings = () => {
  const classes = useStyles();
  const [settings, setSettings] = useState([]);
  const [openAiKey, setOpenAiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
        const key = data.find((s) => s.key === "openAiKey");
        if (key) setOpenAiKey(key.value);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const socket = openSocket();
    socket.on("settings", (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;
    try {
      await api.put(`/settings/${settingKey}`, { value: selectedValue });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveOpenAiKey = async () => {
    try {
      await api.put("/settings/openAiKey", { value: openAiKey });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const setting = settings.find((s) => s.key === key);
    return setting?.value ?? "";
  };

  return (
    <div className={classes.root}>
      <p className={classes.pageTitle}>{i18n.t("settings.title")}</p>
      <div className={classes.container}>
        <div className={classes.card}>
          <p className={classes.cardLabel}>
            {i18n.t("settings.settings.userCreation.name")}
          </p>
          <Select
            margin="dense"
            variant="outlined"
            native
            id="userCreation-setting"
            name="userCreation"
            value={settings.length > 0 ? getSettingValue("userCreation") : ""}
            className={classes.select}
            onChange={handleChangeSetting}
          >
            <option value="enabled">
              {i18n.t("settings.settings.userCreation.options.enabled")}
            </option>
            <option value="disabled">
              {i18n.t("settings.settings.userCreation.options.disabled")}
            </option>
          </Select>
        </div>

        <div className={classes.card}>
          <TextField
            id="api-token-setting"
            label="Token Api"
            margin="dense"
            variant="outlined"
            fullWidth
            InputProps={{ readOnly: true }}
            value={settings.length > 0 ? getSettingValue("userApiToken") : ""}
          />
        </div>

        <div className={classes.apiKeyCard}>
          <div className={classes.apiKeyHeader}>
            <p className={classes.apiKeyLabel}>OpenAI API Key</p>
          </div>
          <p className={classes.apiKeyDesc}>
            Chave de API da OpenAI para habilitar funcionalidades de inteligência artificial no sistema.
          </p>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="sk-..."
            type={showApiKey ? "text" : "password"}
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            className={classes.apiKeyField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowApiKey((v) => !v)}
                    edge="end"
                  >
                    {showApiKey ? (
                      <VisibilityOff size={18} style={{ color: "#9BA3B0" }} />
                    ) : (
                      <Visibility size={18} style={{ color: "#9BA3B0" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            className={classes.saveBtn}
            onClick={handleSaveOpenAiKey}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
