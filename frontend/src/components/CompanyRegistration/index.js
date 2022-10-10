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
import { i18n } from "../../translate/i18n";

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

const UserSchema = Yup.object().shape({
  name: Yup.string().required(`${i18n.t("company.companyModal.required")}`),
  cnpj: Yup.string().required(`${i18n.t("company.companyModal.required")}`),
  phone: Yup.number().typeError().required(`${i18n.t("company.companyModal.required")}`),
  email: Yup.string().email(`${i18n.t("company.companyModal.invalidEmail")}`).required(`${i18n.t("company.companyModal.required")}`),
  address: Yup.string().required(`${i18n.t("company.companyModal.required")}`),
  alias: Yup.string().nullable().required(`${i18n.t("company.companyModal.required")}`),
});

  const [company, setCompany] = useState(initialState);
  const [textAlias, setTextAlias] = useState("");
  const [logo, setLogo] = useState();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      try {
        const { data } = await api.get(`/companies/${companyId}`);
        setCompany((prevState) => {
          return { ...prevState, ...data };
        });
        setLogo(data.logo);
      } catch (err) {
        toastError(err);
      }
    };

    fetchCompany();
  }, [companyId, open]);

  useEffect(() => {
    setTextAlias(company.alias);
  }, [company]);

  const handleClose = () => {
    onClose();
    setCompany(initialState);
    setLogo(null);
  };

  const handleSaveCompany = async (values) => {
    const uploadLogo = async (logo, compId) => {
      if (compId && logo) {
        const formData = new FormData();
        formData.append("file", logo, logo.name);
        formData.set("name", logo.name);

        try {
          const { data } = await api.post(`/companies/uploadLogo/${compId}`, formData);
          return data;
        } catch (err) {
          toastError(err);
        }
      }
      return null;
    }

    const companyData = { ...values };

    if (companyId) {
      try {
        const { data } = await api.put(`/companies/${companyId}`, companyData);
        if (logo) {
          await uploadLogo(logo, data.id);
        }
        toast.success(i18n.t("company.update"));
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        const { data } = await api.post("/companies", companyData);
        if (logo) {
          await uploadLogo(logo, data.id);
        }
        toast.success(i18n.t("company.createdAt"));
      } catch (err) {
        toastError(err);
      }
    }
    handleClose();
  };

  const handleChangeAlias = (e) => {
    const alias = e.target.value.replace(/[^0-9a-zA-Z]/gi, "")
    setCompany((prevState) => {
      return{ ...prevState, alias};
    })
    e.preventDefault();
  };

  const handleChangeName = (e) => {
    const name = e.target.value
    setCompany((prevState) => {
      return{ ...prevState, name};
    })
    e.preventDefault();
  };

  const handleChangeCnpj = (e) => {
      const cnpj = e.target.value.replace(/[^0-9]/gi, "")
      setCompany((prevState) => {
        return { ...prevState, cnpj};
      });
    e.preventDefault();
  };

  const handleChangePhone = (e) => {
    const phone = e.target.value
    setCompany((prevState) => {
      return{ ...prevState, phone};
    })
    e.preventDefault();
  };

  const handleChangeEmail = (e) => {
    const email = e.target.value
    setCompany((prevState) => {
      return{ ...prevState, email};
    })
    e.preventDefault();
  };

  const handleChangeAddress = (e) => {
    const address = e.target.value
    setCompany((prevState) => {
      return{ ...prevState, address};
    })
    e.preventDefault();
  };

  const handleLogoUpload = (e) => {
    const megabyte = 1000000;
    if (e.target.files[0].size >= megabyte) {
      toast.error(i18n.t("company.companyModal.image"));
    } else {
      setLogo(e.target.files[0]);
    }
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
                    onChange={handleChangeAlias}
                    name="alias"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("company.companyModal.alias")}
                    error={touched.alias && Boolean(errors.alias)}
                    helperText={touched.alias && errors.alias}
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    onChange={handleChangeName}
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
                    onChange={handleChangeCnpj}
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
                    onChange={handleChangePhone}
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
                    onChange={handleChangeEmail}
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
                    onChange={handleChangeAddress}
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
                    {i18n.t("company.companyModal.upload")}
                    <input
                      type="file"
                      onChange={(e) => {handleLogoUpload(e)}}
                      hidden
                    />
                  </Button>
                  <Typography variant="subtitle1" gutterBottom>
                    { logo ? <img src={logo} alt="Logo" height="50px" />: `${i18n.t("company.companyModal.logo")}` }
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
                  variant="contained"
                  className={classes.btnWrapper}
                  disabled={isSubmitting}
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
