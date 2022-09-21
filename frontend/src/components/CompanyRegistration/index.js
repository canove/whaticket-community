import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
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

const UserSchema = Yup.object().shape({
  name: Yup.string().required("Campo Obrigatório!"),
  cnpj: Yup.number().typeError().required("Campo Obrigatório!"),
  phone: Yup.number().typeError().required("Campo Obrigatório!"),
  email: Yup.string().email("Invalid email").required("Campo Obrigatório!"),
  address: Yup.string().required("Campo Obrigatório!"),
  //alias: Yup.string().nullable().required("Campo Obrigatório!"),
});

const CompanyRegistration = ({ open, onClose, companyId }) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const initialState = {
    id: "",
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    alias: "",
  };

  const [company, setCompany] = useState(initialState);
  const [textAlias, setAlias] = useState("");
  const [logo, setLogo] = useState();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      try {
        const { data } = await api.get(`/companies/${companyId}`);
        setCompany((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchCompany();
  }, [companyId, open]);

  useEffect(() => {
    setAlias(company.alias);
  }, [company]);

  const handleClose = () => {
    onClose();
    setCompany(initialState);
    setLogo(null);
  };

  const handleSaveCompany = async (values) => {
    const companyData = { ...values, alias: textAlias };
    try {
      if (companyId) {
        await api.put(`/companies/${companyId}`, companyData);
      } else {
        await api.post("/companies", companyData);
      }
      toast.success(i18n.t("company.success"));
    } catch (err) {
      toastError(err);
    }

    handleClose();
  };

  const handleChangeAlias = (e) => {
    setAlias(e.target.value.replace(/[^0-9a-zA-Z]/gi, ""));
    e.preventDefault();
  };

  const handleLogoUpload = (e) => {
    setLogo(e.target.files[0]);
  }

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {companyId
            ? `${i18n.t("company.companyModal.titleEdit")}`
            : `${i18n.t("company.companyModal.titleAdd")}`}
        </DialogTitle>
        <Formik
          initialValues={company}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCompany(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    value={textAlias}
                    onChange={handleChangeAlias}
                    name="alias"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("Alias")}
                    error={touched.alias && Boolean(errors.alias)}
                    helperText={touched.alias && errors.alias}
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    name="name"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("company.companyModal.name")}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("company.companyModal.cnpj")}
                    name="cnpj"
                    error={touched.cnpj && Boolean(errors.cnpj)}
                    helperText={touched.cnpj && errors.cnpj}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("company.companyModal.phone")}
                    name="phone"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("company.companyModal.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("company.companyModal.address")}
                    name="address"
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Button
                    variant="contained"
                    component="label"
                  >
                    Upload Logo
                    <input
                      type="file"
                      onChange={(e) => {handleLogoUpload(e)}}
                      hidden
                    />
                  </Button>
                  <Typography variant="subtitle1" gutterBottom>
                    { logo ? 'Com Logo' : 'Sem Logo' }
                  </Typography>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {companyId
                    ? `${i18n.t("userModal.buttons.okEdit")}`
                    : `${i18n.t("userModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CompanyRegistration;
