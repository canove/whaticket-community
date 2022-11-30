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

const TemplateModal = ({ open, onClose }) => {
  const { i18n } = useTranslation();
  const classes = useStyles();

  const initialState = {
    name: "",
    footerText: "",
  };
  const [template, setTemplate] = useState(initialState);

  const [category, setCategory] = useState("transactional");
  const [bodyText, setBodyText] = useState("");

  const [paramsQuantity, setParamsQuantity] = useState(0);
  const [parameters, setParameters] = useState([]);
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const testParams = async () => {
        const parameters = bodyText.match(/\{{(.*?)\}}/g) || [];
        const parametersQuantity = parameters.length;

        let text = bodyText;
        let map = mapping || {};

        for (let i = 0; i < parametersQuantity; i++) {
          text = text.replace(parameters[i], `{{${i+1}}}`);
          map = { ...map, [`{{${i + 1}}}`]: "name" };
        }

        setParameters(parameters);
        setParamsQuantity(parametersQuantity);
        setBodyText(text);
        setMapping(map);
      };
      testParams();
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [bodyText]);

  const handleSubmit = async (values) => {
    const templateData = {
      ...values,
      category,
      bodyText,
      mapping: JSON.stringify(mapping),
    };

    try {
      await api.post(`/whatsappTemplate/create/`, templateData);
      toast.success(i18n.t("templates.templateModal.success"));
    } catch (err) {
      toastError(err);
    }

    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTemplate(initialState);
    setCategory("transactional");
    setBodyText("");
    setParamsQuantity(0);
    setMapping({});
    setParameters([])
  };
  
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleChangeBodyText = (e) => {
    setBodyText(e.target.value);
  };

  const handleMappingChange = (e, param) => {
    setMapping(prevMapping => ({ ...prevMapping, [param]: e.target.value }));
  }

  const handleAddParam = () => {
    setBodyText(prevText => `${prevText} {{${paramsQuantity + 1}}}`);
    setParamsQuantity(prevQuantity => prevQuantity + 1);
    setMapping(prevMapping => ({ ...prevMapping, [`{{${paramsQuantity + 1}}}`]: "name" }));
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
                <div className={classes.multFieldLine}>
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
                    onChange={(e) => {
                      setValues({ name: e.target.value.toLowerCase().replaceAll(" ", "_") })
                    }}
                  />
                </div>
                <div style={{ marginTop: "5px" }}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="category-select-label">
                      {i18n.t("templates.templateModal.category")}
                    </InputLabel>
                    <Select
                      labelId="category-select-label"
                      id="category-select"
                      label={i18n.t("templates.templateModal.category")}
                      value={category}
                      onChange={handleCategoryChange}
                      fullWidth
                    >
                      <MenuItem value={"transactional"}>
                        {i18n.t("templates.templateModal.transactional")}
                      </MenuItem>
                      <MenuItem value={"marketing"}>
                        {i18n.t("templates.templateModal.marketing")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("templates.templateModal.body")}
                    type="bodyText"
                    onChange={(e) => {
                      handleChangeBodyText(e);
                    }}
                    value={bodyText}
                    multiline
                    minRows={5}
                    fullWidth
                    maxLength="1024"
                    name="bodyText"
                    error={touched.bodyText && Boolean(errors.bodyText)}
                    helperText={touched.bodyText && errors.bodyText}
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Button onClick={handleAddParam}>
                    Adicionar Parametro
                  </Button>
                </div>
                <div>
                  { parameters.map((param, index) => {
                    return (
                      <FormControl
                        key={index} 
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
                          value={mapping[param] || ""}
                          onChange={(e) => handleMappingChange(e, param)}
                          fullWidth
                        >
                          <MenuItem value={""} disabled>Parametros:</MenuItem>
                          { paramTypes.map(paramType => (
                            <MenuItem key={paramType.value} value={paramType.value}>{paramType.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  })}
                </div>
                <div>
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
                    onChange={(e) => handleChange(e)}
                  />
                </div>
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

export default TemplateModal;
