import React, { useState, useContext, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
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
}));

const CopyOfficialTemplateModal = ({ open, onClose, officialTemplate, connection }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const initialState = {
    name: "",
    headerFormat: "",
    headerExample: "",
    bodyText: "",
    footerText: "",
    category: "",
    buttons: []
  }

  const [template, setTemplate] = useState(initialState);
  const [parameters, setParameters] = useState([]);
  const [mapping, setMapping] = useState({});
  const [headerVar, setHeaderVar] = useState("");
  const [documentName, setDocumentName] = useState("");

  useEffect(() => {
    if (officialTemplate) {
      const getTemplateComponent = (type, item) => {
        const component = officialTemplate.components.find(component => component.type === type);
        
        if (item === "buttons") return component ? component.buttons : [];
        if (item === "text") return component ? component.text : ""; 
        if (item === "format") return component ? component.format : ""; 
        if (item === "example") {
          const example = component ? component.example : "";
          const handle = example ? example.header_handle : "";

          return (handle && handle.length > 0) ? handle[0] : "";
        }
      }

      const getParameters = () => {
        const body = getTemplateComponent("BODY", "text");

        const parameters = body.match(/\{{(.*?)\}}/g) || [];
        setParameters(parameters);
      }

      setTemplate({
        name: officialTemplate.name,
        headerFormat: getTemplateComponent("HEADER", "format"),
        headerExample: getTemplateComponent("HEADER", "example"),
        bodyText: getTemplateComponent("BODY", "text"),
        footerText: getTemplateComponent("FOOTER", "text"),
        buttons: getTemplateComponent("BUTTONS", "buttons"),
        category: officialTemplate.category,
      });

      getParameters();
    }
  }, [officialTemplate]);

  const handleSubmit = async () => {
    if (Object.keys(mapping).length != parameters.length) toast.error("Escolha as variáveis");

    const body = {
      officialTemplate,
      mapping,
      headerVar,
      documentName,
      whatsappId: connection.id,
    }

    try {
      await api.post(`/whatsappTemplate/createOfficialTemplate/`, body);
      toast.success(i18n.t("templates.templateModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setTemplate(initialState);
    setMapping({});
    setParameters([])
    setHeaderVar("");
    setDocumentName("");
  };

  const handleMappingChange = (e, param) => {
    setMapping(prevMapping => ({ ...prevMapping, [param]: e.target.value }));
  }

  const paramTypes = [
    {
      name: "Nome",
      value: "name"
    },
    {
      name: "CPF",
      value: "documentNumber"
    },
    {
      name: "Telefone",
      value: "phoneNumber"
    },
    {
      name: "Var 1",
      value: "var1"
    },
    {
      name: "Var 2",
      value: "var2"
    },
    {
      name: "Var 3",
      value: "var3"
    },
    {
      name: "Var 4",
      value: "var4"
    },
    {
      name: "Var 5",
      value: "var5"
    },
    {
      name: "Custom Param",
      value: "custom"
    }
  ];

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>{i18n.t("templates.templateModal.title")}</DialogTitle>
        <Formik
          initialValues={template}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            handleSubmit(values);
            setTimeout(() => {
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting, setValues, handleChange }) => (
            <Form>
              <DialogContent dividers>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label="Header Format"
                    autoFocus
                    name="headerFormat"
                    error={touched.headerFormat && Boolean(errors.headerFormat)}
                    helperText={touched.headerFormat && errors.headerFormat}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field
                    as={TextField}
                    label="Header Example"
                    autoFocus
                    name="headerExample"
                    error={touched.headerExample && Boolean(errors.headerExample)}
                    helperText={touched.headerExample && errors.headerExample}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    className={classes.textField}
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                { template.headerFormat &&
                  <div>
                    <FormControl
                        fullWidth 
                        variant="outlined" 
                        style={{ marginTop: "5px", marginBottom: "5px" }}
                      >
                        <InputLabel id="param-type-select-label">
                          {"Header Var"}
                        </InputLabel>
                        <Select
                          labelId="param-type-select-label"
                          id="param-type-select"
                          label={"Header Var"}
                          value={paramTypes.some(paramType => paramType.value === headerVar) ? headerVar : "custom"}
                          onChange={(e) => setHeaderVar(e.target.value)}
                          fullWidth
                        >
                          <MenuItem value={""} disabled>Parametros:</MenuItem>
                          { paramTypes.map(paramType => (
                            <MenuItem key={paramType.value} value={paramType.value}>{paramType.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      { (headerVar === "custom" || !paramTypes.some(paramType => paramType.value === headerVar)) && 
                        <Field
                          as={TextField}
                          label={"Custom Param"}
                          autoFocus
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          name="customParam"
                          value={headerVar}
                          className={classes.textField}
                          onChange={(e) => setHeaderVar(e.target.value)}
                        />
                      }
                      { template.headerFormat === "DOCUMENT" &&
                        <div>
                        <FormControl
                            fullWidth 
                            variant="outlined" 
                            style={{ marginTop: "5px", marginBottom: "5px" }}
                          >
                            <InputLabel id="param-type-select-label">
                              {"Document Name"}
                            </InputLabel>
                            <Select
                              labelId="param-type-select-label"
                              id="param-type-select"
                              label={"Document Name"}
                              value={paramTypes.some(paramType => paramType.value === documentName) ? documentName : "custom"}
                              onChange={(e) => setDocumentName(e.target.value)}
                              fullWidth
                            >
                              <MenuItem value={""} disabled>Parametros:</MenuItem>
                              { paramTypes.map(paramType => (
                                <MenuItem key={paramType.value} value={paramType.value}>{paramType.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          { (documentName === "custom" || !paramTypes.some(paramType => paramType.value === documentName)) && 
                            <Field
                              as={TextField}
                              label={"Custom Param"}
                              autoFocus
                              variant="outlined"
                              margin="dense"
                              fullWidth
                              name="customParam"
                              value={documentName}
                              className={classes.textField}
                              onChange={(e) => setDocumentName(e.target.value)}
                            />
                          }
                        </div>
                      }
                  </div>
                }
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.body")}
                    type="bodyText"
                    multiline
                    minRows={5}
                    fullWidth
                    maxLength="1024"
                    name="bodyText"
                    error={touched.bodyText && Boolean(errors.bodyText)}
                    helperText={touched.bodyText && errors.bodyText}
                    variant="outlined"
                    margin="dense"
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div>
                { parameters.map((param, index) => {
                    return (
                      <div key={index}>
                      <FormControl
                        fullWidth 
                        variant="outlined" 
                        style={{ marginTop: "10px" }}
                      >
                        <InputLabel id="param-type-select-label">
                          {param}
                        </InputLabel>
                        <Select
                          labelId="param-type-select-label"
                          id="param-type-select"
                          label={param}
                          value={paramTypes.some(paramType => paramType.value === mapping[param]) ? mapping[param] || "" : "custom"}
                          onChange={(e) => handleMappingChange(e, param)}
                          fullWidth
                        >
                          <MenuItem value={""} disabled>Parametros:</MenuItem>
                          { paramTypes.map(paramType => (
                            <MenuItem key={paramType.value} value={paramType.value}>{paramType.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      { (mapping[param] === "custom" || !paramTypes.some(paramType => paramType.value === mapping[param])) && 
                        <Field
                          as={TextField}
                          label={"Custom Param"}
                          autoFocus
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          name="customParam"
                          value={mapping[param] || ""}
                          className={classes.textField}
                          onChange={(e) => {
                            setValues({ customParam: e.target.value })
                            handleMappingChange(e, param)
                          }}
                        />
                      }
                      </div>
                    );
                  })}
                </div>
                <div style={{ paddingTop: "5px" }}>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.footer")}
                    type="footerText"
                    multiline
                    minRows={2}
                    fullWidth
                    maxLength="60"
                    name="footerText"
                    error={touched.footerText && Boolean(errors.footerText)}
                    helperText={touched.footerText && errors.footerText}
                    variant="outlined"
                    margin="dense"
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                {template.buttons.length > 0 &&
                  <div style={{ border: "1px solid rgba(0, 0, 0, 0.5)", borderRadius: "5px", padding: "8px", marginTop: "8px" }}>
                    <Typography>Botões: </Typography>
                    { template.buttons.map((button, index) => (
                      <Tooltip title={button.type} key={index}>
                        <Button
                          variant="outlined"
                          fullWidth
                        >
                          {button.text}
                        </Button>
                      </Tooltip>
                    )) }
                  </div>
                }
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("templates.buttons.cancel")}
                </Button>
                {/* <Button
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={handleOpenParamModal}
                >
                  {"{{ }}"}
                </Button> */}
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                  className={classes.btnWrapper}
                >
                  {i18n.t("templates.buttons.add")}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CopyOfficialTemplateModal;
