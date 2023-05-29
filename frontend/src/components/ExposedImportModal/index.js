import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import axios from "axios";
import DoubleArrowIcon from "@material-ui/icons/DoubleArrow";
import ConfirmationModal from "../ConfirmationModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(3),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const ExposedImportModal = ({ open, onClose, exposedImportId }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { whatsApps } = useContext(WhatsAppsContext);

  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [payload, setPayload] = useState("");

  const initialMapping = {
    name: "",
    phoneNumber: "",
    documentNumber: "",
    template: "",
    templateParams: "",
    message: "",
    var1: "",
    var2: "",
    var3: "",
    var4: "",
    var5: "",
    phoneNumberFrom: "",
    category: "",
    queue: "",
  };
  const [mapping, setMapping] = useState(initialMapping);
  const [mappingValues, setMappingValues] = useState(initialMapping);

  const [connectionType, setConnectionType] = useState(false);
  const [useConnectionType, setUseConnectionType] = useState(false);
  const [openConnectionSelect, setOpenConnectionSelect] = useState(false);
  const [connections, setConnections] = useState([]);

  const [menus, setMenus] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState("");

  const [offConnections, setOffConnections] = useState([]);
  const [offConnection, setOffConnection] = useState(null);
  const [offPhoneNumbers, setOffPhoneNumbers] = useState([]);

  const [offTemplates, setOffTemplates] = useState([]);
  const [selectedOffTemplate, setSelectedOffTemplate] = useState("");

  const [connectionFiles, setConnectionFiles] = useState([]);
  const [selectedConnectionFile, setSelectedConnectionFile] = useState([]);

  const initialRequiredItems = {
    name: false,
    phoneNumber: false,
    documentNumber: false,
    template: false,
    templateParams: false,
    message: false,
    var1: false,
    var2: false,
    var3: false,
    var4: false,
    var5: false,
    phoneNumberFrom: false,
    category: false,
    queue: false,
  };
  const [requiredItems, setRequiredItems] = useState(initialRequiredItems);

  useEffect(() => {
    const fetchExposedImport = async () => {
      try {
        const { data } = await api.get(`/exposedImports/${exposedImportId}`);
        setName(data.name);
        setMapping({ ...initialMapping, ...JSON.parse(data.mapping) });

        setConnectionType(data.official ?? connectionType);
        setTemplate(data.templateId);
        setSelectedOffTemplate(data.officialTemplatesId);
        setOffConnection(data.officialConnectionId);

        let connectionFileIds = data.connectionFileIds ? data.connectionFileIds.split(",") : [];
        connectionFileIds = connectionFileIds.map(idString => parseInt(idString));
        setSelectedConnectionFile(connectionFileIds);

        let newConnections = data.whatsappIds ? data.whatsappIds.split(",") : ["Todos"];

        if (!newConnections.includes("Todos")) {
          newConnections = newConnections.map(id => parseInt(id));
        }

        setConnections(newConnections);

        if (data.requiredItems) {
          setRequiredItems(prevItems => {
            let obj = prevItems;
            let items = JSON.parse(data.requiredItems);

            items.forEach(item => {
              obj[item] = true;
            });
  
            return obj;
          });
        }
      } catch (err) {
        toastError(err);
      }
    };

    const fetchApiToken = async () => {
      try {
        const { data } = await api.get("/settings");
        const { value } = data.find((s) => s.key === "userApiToken");
        setToken(value);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchTemplates = async () => {
      try {
        const { data } = await api.get("/TemplatesData/list/");
        setTemplates(data.templates);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchMenus = async () => {
      try {
        const { data } = await api.get("menus/company");
        setMenus(data);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchPhoneNumbers = async () => {
      try {
        const { data } = await api.get("/officialWhatsapps");
        setOffPhoneNumbers(data);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchOffTemplates = async () => {
      try {
        const { data } = await api.get("/whatsappTemplate/");
        setOffTemplates(data);
      } catch (err) {
        toastError(err);
      }
    };

    const fetchConnectionFiles = async () => {
			try {
				const { data } = await api.get(`/connectionFiles/`);
				setConnectionFiles(data);
			} catch (err) {
				toastError(err);
			}
		};

    if (open) {
      fetchMenus();
      fetchTemplates();
      fetchPhoneNumbers();
      fetchOffTemplates();
      fetchConnectionFiles();
    }

    if (exposedImportId) {
      fetchExposedImport();
      fetchApiToken();
    }
  }, [open, exposedImportId]);

  useEffect(() => {
    const fetchOffConnections = async () => {
      try {
        const { data } = await api.get("/whatsappTemplate/getWhatsapps", {
          params: {
            templateId: selectedOffTemplate,
          },
        });
        setOffConnections(data);
      } catch (err) {
        toastError(err);
      }
    };

    if (selectedOffTemplate && selectedOffTemplate !== "Nenhum") fetchOffConnections();
  }, [selectedOffTemplate]);

  useEffect(() => {
    if (menus) {
      let offWhats = false;
      let noOffWhats = false;

      menus.forEach((menu) => {
        if (menu.name === "Official Connections") {
          offWhats = true;
        }

        if (menu.name === "Connections") {
          noOffWhats = true;
        }
      });

      if (offWhats && noOffWhats) {
        setUseConnectionType(true);
      }

      if (offWhats && !noOffWhats) {
        setUseConnectionType(false);
        setConnectionType(true);
      }

      if (!offWhats && noOffWhats) {
        setUseConnectionType(false);
        setConnectionType(false);
      }
    }
  }, [menus]);

  const handleClose = () => {
    setName("");
    setPayload("");

    setMapping(initialMapping);
    setMappingValues(initialMapping);

    setConnectionType(false);
    setUseConnectionType(false);
    setOpenConnectionSelect(false);
    setTemplate("");
    setConnections([]);
    setOffConnection("");
    setSelectedOffTemplate("");
    setSelectedConnectionFile([]);

    setRequiredItems(initialRequiredItems);

    onClose();
  };

  const handleSubmit = async () => {
    let required = [];

    Object.keys(requiredItems).forEach(item => {
      if (requiredItems[item]) required.push(item);
    });

    const importData = {
      name,
      mapping: JSON.stringify(mapping),
      template: template ? template : null,
      connections: connections,
      connectionType,
      officialConnectionId: offConnection ? offConnection : null,
      officialTemplatesId: selectedOffTemplate ? selectedOffTemplate : null,
      requiredItems: required.length > 0 ? JSON.stringify(required) : null,
      connectionFileIds: selectedConnectionFile.length > 0 ? selectedConnectionFile.toString() : null,
    };

    // if ((connectionType && !importData.officialTemplatesId) || (!connectionType && !template)) {
    //   toast.error("Template is required.");
    //   return;
    // }

    try {
      if (exposedImportId) {
        await api.put(`/exposedImports/${exposedImportId}`, importData);
        toast.success(i18n.t("exposedImports.modal.editSuccess"));
      } else {
        await api.post("/exposedImports/", importData);
        toast.success(i18n.t("exposedImports.modal.createSuccess"));
      }
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    if (payload) {
      handleRelationChange(mapping.name, "name");
      handleRelationChange(mapping.phoneNumber, "phoneNumber");
      handleRelationChange(mapping.documentNumber, "documentNumber");
      handleRelationChange(mapping.template, "template");
      handleRelationChange(mapping.templateParams, "templateParams");
      handleRelationChange(mapping.message, "message");
      handleRelationChange(mapping.var1, "var1");
      handleRelationChange(mapping.var2, "var2");
      handleRelationChange(mapping.var3, "var3");
      handleRelationChange(mapping.var4, "var4");
      handleRelationChange(mapping.var5, "var5");
      handleRelationChange(mapping.phoneNumberFrom, "phoneNumberFrom");
      handleRelationChange(mapping.category, "category");
      handleRelationChange(mapping.queue, "queue");
    }
  }, [payload]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const jsonStringToObj = (jsonString) => {
    try {
      const responseObj = JSON.parse(jsonString);
      return responseObj;
    } catch {
      return false;
    }
  };

  const getDinamicValue = (path) => {
    const keys = path.split(".");
    let value = jsonStringToObj(payload);

    for (let i = 0; i < keys.length; i++) {
      if (value === undefined) {
        return "";
      }

      if (Array.isArray(value)) {
        let array = [];

        for (const item of value) {
          array.push(item[keys[i]]);
        }

        value = array;
      } else {
        value = value[keys[i]];
      }
    }

    return value ? value : "";
  };

  const getRelationValue = (newValue) => {
    let value = newValue;

    while (value.match(/\{{(.*?)\}}/)) {
      const param = value.match(/\{{(.*?)\}}/);

      const dinamicValue = getDinamicValue(param[1].trim());

      value = value.replace(param[0], dinamicValue);
    }

    return value;
  };

  const handleRelationChange = (newValue, relation) => {
    const value = getRelationValue(newValue);

    setMapping((prev) => {
      return { ...prev, [relation]: newValue };
    });

    setMappingValues((prev) => {
      return { ...prev, [relation]: value };
    });
  };

  const handleConnectionTypeChange = (e) => {
    setConnectionType(e.target.value);
    setConnections([]);
    setTemplate("");
    setOffConnection("");
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
  };

  const handleConnectionChange = (e) => {
    const value = e.target.value;
    const allIndex = value.indexOf("Todos");

    if (allIndex !== -1 && allIndex === value.length - 1) {
      setConnections([]);

      const allConnections = ["Todos"];

      setConnections(allConnections);
      setOpenConnectionSelect(false);
    } else {
      if ((allIndex || allIndex === 0) && allIndex !== -1) {
        value.splice(allIndex, 1);
      }
      setConnections(typeof value === "string" ? value.split(",") : value);
    }
  };

  const handleOpenConnectionSelect = () => {
    setOpenConnectionSelect(true);
  };

  const handleCloseConnectionSelect = () => {
    setOpenConnectionSelect(false);
  };

  const handleOffConnectionChange = (e) => {
    setOffConnection(e.target.value);
    setConnections([]);
  };

  const handleChangeRequiredItem = (e, item) => {
    setRequiredItems(prevItems => ({...prevItems, [item]: !prevItems[item] }));
  }

  const handleChangeConnectionFile = (e) => {
    const value = e.target.value;
    const noneIndex = value.indexOf("Nenhum");
    console.log(value);
    if (noneIndex !== -1 && noneIndex === value.length - 1) {
      setSelectedConnectionFile([]);
    } else {
      if (noneIndex !== -1) {
        value.splice(noneIndex, 1);
      }

      setSelectedConnectionFile(typeof value === "string" ? value.split(",") : value);
    }

    setConnections([]);
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {exposedImportId
            ? `${i18n.t("exposedImports.modal.edit")}`
            : `${i18n.t("exposedImports.modal.create")}`}
        </DialogTitle>
        <DialogContent dividers>
          <div>
            <TextField
              as={TextField}
              label={i18n.t("exposedImports.modal.name")}
              value={name}
              name="name"
              onChange={(e) => {
                handleNameChange(e);
              }}
              variant="outlined"
              margin="dense"
              fullWidth
            />
          </div>
          {useConnectionType && (
            <>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="connection-type-select-label">
                  Tipo de Disparo
                </InputLabel>
                <Select
                  labelId="connection-type-select-label"
                  id="connection-type-select"
                  value={connectionType}
                  label="Tipo de Disparo"
                  onChange={handleConnectionTypeChange}
                  style={{ width: "100%" }}
                  variant="outlined"
                >
                  <MenuItem value={true}>
                    {i18n.t("importModal.form.official")}
                  </MenuItem>
                  <MenuItem value={false}>
                    {i18n.t("importModal.form.notOfficial")}
                  </MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          {connectionType === true && (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="off-connection-type-select-label">
                Conexões
              </InputLabel>
              <Select
                labelId="off-connection-type-select-label"
                id="connection-type-select"
                value={offConnection ?? ""}
                label="Conexões"
                onChange={handleOffConnectionChange}
                style={{ width: "100%" }}
                variant="outlined"
              >
                {offPhoneNumbers.map((offConnection) => (
                  <MenuItem key={offConnection.id} value={offConnection.id}>
                    {offConnection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {connectionType === true && offConnection && (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="off-template-select-label">
                Templates
              </InputLabel>
            <Select
              variant="outlined"
              labelId="off-template-select-label"
              label="Templates"
              id="off-template-select"
              value={selectedOffTemplate}
              // label={"Números"}
              onChange={(e) => setSelectedOffTemplate(e.target.value)}
              style={{ width: "100%" }}
            >
              <MenuItem value={""}>
                Nenhum
              </MenuItem>
              {offTemplates.map((offTemplate) => (
                <MenuItem key={offTemplate.id} value={offTemplate.id}>
                  {offTemplate.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          )}
          {connectionType === true && offConnection && selectedOffTemplate && (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="off-phone-numbers-select-label">
                Números
              </InputLabel>
              <Select
                variant="outlined"
                labelId="off-phone-numbers-select-label"
                id="off-phone-numbers-select"
                value={connections}
                label={"Números"}
                onChange={handleConnectionChange}
                multiple
                open={openConnectionSelect}
                onOpen={handleOpenConnectionSelect}
                onClose={handleCloseConnectionSelect}
                style={{ width: "100%" }}
              >
                <MenuItem value={"Todos"}>
                  {i18n.t("importModal.form.all")}
                </MenuItem>
                {offConnections.map((offConnection) => (
                  <MenuItem key={offConnection.whatsappId} value={offConnection.whatsappId}>
                    {offConnection["whatsapp.name"]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {connectionType === false && (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel InputLabel id="connection-select-label">Categoria</InputLabel>
              <Select
                variant="outlined"
                labelId="category-select-label"
                id="category-select"
                value={selectedConnectionFile}
                label="Categoria"
                onChange={(e) => {
                  handleChangeConnectionFile(e);
                }}
                multiple
                style={{ width: "100%" }}
              >
                <MenuItem value={"Nenhum"}>
                  {i18n.t("importModal.form.none")}
                </MenuItem>
                {connectionFiles.length > 0 &&
                  connectionFiles.map((connectionFile, index) => {
                    return (
                      <MenuItem key={index} value={connectionFile.id}>
                        {connectionFile.name}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          )}
          {connectionType === false && (
            <FormControl variant="outlined" margin="normal" fullWidth>
              <InputLabel id="connection-select-label">Conexões</InputLabel>
              <Select
                variant="outlined"
                labelId="connection-select-label"
                id="connection-select"
                value={connections}
                label={"Conexões"}
                onChange={handleConnectionChange}
                multiple
                open={openConnectionSelect}
                onOpen={handleOpenConnectionSelect}
                onClose={handleCloseConnectionSelect}
                style={{ width: "100%" }}
              >
                <MenuItem value={"Todos"}>
                  {i18n.t("importModal.form.all")}
                </MenuItem>
                {whatsApps &&
                  whatsApps.map((whats) => {
                    if (
                      whats.official === connectionType &&
                      whats.status === "CONNECTED" &&
                      (selectedConnectionFile.length === 0 || selectedConnectionFile.includes(whats.connectionFileId))
                    ) {
                      return (
                        <MenuItem key={whats.id} value={whats.id}>
                          {whats.name}
                        </MenuItem>
                      );
                    }
                    return null;
                  })}
              </Select>
            </FormControl>
          )}
          {connectionType === false && (
            <>
              <FormControl variant="outlined" margin="normal" fullWidth>
                <InputLabel id="template-select-label">Template</InputLabel>
                <Select
                  variant="outlined"
                  labelId="template-select-label"
                  id="template-selec"
                  value={template}
                  label="Template"
                  onChange={(e) => {
                    handleTemplateChange(e);
                  }}
                  style={{ width: "100%" }}
                >
                  <MenuItem value={"Nenhum"}>
                    {i18n.t("importModal.form.none")}
                  </MenuItem>
                  {templates.length > 0 &&
                    templates.map((template, index) => {
                      return (
                        <MenuItem key={index} value={template.id}>
                          {template.name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </>
          )}
          {exposedImportId && (
            <>
              <div>
                <TextField
                  as={TextField}
                  label="URL"
                  value={`${process.env.REACT_APP_BACKEND_URL}exposedImports/${exposedImportId}`}
                  name="url"
                  variant="outlined"
                  margin="dense"
                  onChange={() => {}}
                  fullWidth
                />
              </div>
              <div>
                <TextField
                  as={TextField}
                  label="Header"
                  name="header"
                  value={JSON.stringify(
                    { Authorization: `Bearer ${token}` },
                    null,
                    2
                  )}
                  multiline
                  minRows={3}
                  maxLength="1024"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  onChange={() => {}}
                />
              </div>
            </>
          )}
          <Paper variant="outlined" style={{ marginTop: "10px" }}>
            <Typography
              style={{
                margin: "10px",
                marginBottom: "0px",
              }}
            >
              {i18n.t("exposedImports.modal.relations")}
            </Typography>
            <div>
              <div
                style={{
                  margin: "10px",
                  marginTop: "0px",
                }}
              >
                <TextField
                  as={TextField}
                  label="Payload"
                  name="payload"
                  value={payload}
                  multiline
                  minRows={3}
                  maxRows={10}
                  maxLength="1024"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  placeholder={i18n.t("exposedImports.modal.pastePayload")}
                  onChange={(e) => {
                    setPayload(e.target.value);
                  }}
                />
              </div>
              <Typography
                style={{
                  margin: "10px",
                  marginBottom: "0px",
                }}
              >
                {i18n.t("exposedImports.modal.tutorial")} {`{{variável}}`}
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Name"
                    value={mappingValues.name}
                    name="name"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Name Relation"
                    value={mapping.name}
                    name="nameRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "name");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["name"]} onChange={(e) => { handleChangeRequiredItem(e, "name") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Phone Number"
                    value={mappingValues.phoneNumber}
                    name="phoneNumber"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Phone Number Relation"
                    value={mapping.phoneNumber}
                    name="phoneNumberRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "phoneNumber");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["phoneNumber"]} onChange={(e) => { handleChangeRequiredItem(e, "phoneNumber") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Document Number"
                    value={mappingValues.documentNumber}
                    name="documentNumber"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Document Number Relation"
                    value={mapping.documentNumber}
                    name="documentNumberRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "documentNumber");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["documentNumber"]} onChange={(e) => { handleChangeRequiredItem(e, "documentNumber") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Template"
                    value={mappingValues.template}
                    name="template"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Template Relation"
                    value={mapping.template}
                    name="templateRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "template");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["template"]} onChange={(e) => { handleChangeRequiredItem(e, "template") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Template Params"
                    value={mappingValues.templateParams}
                    name="templateParams"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Template Params Relation"
                    value={mapping.templateParams}
                    name="templateParamsRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "templateParams");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["templateParams"]} onChange={(e) => { handleChangeRequiredItem(e, "templateParams") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Message"
                    value={mappingValues.message}
                    name="message"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Message Relation"
                    value={mapping.message}
                    name="messageRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "message");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["message"]} onChange={(e) => { handleChangeRequiredItem(e, "message") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 1"
                    value={mappingValues.var1}
                    name="var1"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 1 Relation"
                    value={mapping.var1}
                    name="var1Relation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "var1");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["var1"]} onChange={(e) => { handleChangeRequiredItem(e, "var1") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 2"
                    value={mappingValues.var2}
                    name="var2"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 2 Relation"
                    value={mapping.var2}
                    name="var2Relation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "var2");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["var2"]} onChange={(e) => { handleChangeRequiredItem(e, "var2") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 3"
                    value={mappingValues.var3}
                    name="var3"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 3 Relation"
                    value={mapping.var3}
                    name="var3Relation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "var3");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["var3"]} onChange={(e) => { handleChangeRequiredItem(e, "var3") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 4"
                    value={mappingValues.var4}
                    name="var4"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 4 Relation"
                    value={mapping.var4}
                    name="var4Relation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "var4");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["var4"]} onChange={(e) => { handleChangeRequiredItem(e, "var4") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 5"
                    value={mappingValues.var5}
                    name="var5"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Var 5 Relation"
                    value={mapping.var5}
                    name="var5Relation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "var5");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["var5"]} onChange={(e) => { handleChangeRequiredItem(e, "var5") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Número para Disparo"
                    value={mappingValues.phoneNumberFrom}
                    name="phoneNumberFrom"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Número para Disparo Relation"
                    value={mapping.phoneNumberFrom}
                    name="phoneNumberFromRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "phoneNumberFrom");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["phoneNumberFrom"]} onChange={(e) => { handleChangeRequiredItem(e, "phoneNumberFrom") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Categoria"
                    value={mappingValues.category}
                    name="category"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Categoria Relation"
                    value={mapping.category}
                    name="categoryRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "category");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["category"]} onChange={(e) => { handleChangeRequiredItem(e, "category") }} />}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    margin: "0 5px 5px 10px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Fila"
                    value={mappingValues.queue}
                    name="queue"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled
                  />
                </div>
                <div
                  style={{
                    width: "50%",
                    margin: "0 10px 5px 5px",
                  }}
                >
                  <TextField
                    as={TextField}
                    label="Fila Relation"
                    value={mapping.queue}
                    name="queueRelation"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    onChange={(e) => {
                      handleRelationChange(e.target.value, "queue");
                    }}
                  />
                </div>
                <FormControlLabel
                  label={i18n.t("exposedImports.modal.required")}
                  control={<Checkbox color="primary" checked={requiredItems["queue"]} onChange={(e) => { handleChangeRequiredItem(e, "queue") }} />}
                />
              </div>
            </div>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {exposedImportId
              ? `${i18n.t("exposedImports.modal.save")}`
              : `${i18n.t("exposedImports.modal.create")}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExposedImportModal;
