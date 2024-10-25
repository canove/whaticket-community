import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import UploadButtons from "../UploadButtons";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
} from "@material-ui/core";

import { Visibility, VisibilityOff } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

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
  multFieldLineTwo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
  image: Yup.mixed()
    .nullable()
    .test("fileType", "Unsupported file format", (value) => {
      if (value === null) return true;
      return ["image/jpeg", "image/png", "image/gif"].includes(value.type);
    })
    .test(
      "fileSize",
      "File too large, should be less than 2MB",
      (value) => !value || (value && value.size <= 2 * 1024 * 1024)
    ),
});

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
    image: null,
  };
  const { user: loggedInUser } = useContext(AuthContext);
  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappId, setWhatsappId] = useState(false);
  const { loading, whatsApps } = useWhatsApps();
  const [imagePreview, setImagePreview] = useState(initialState.image);
  const [imageFile, setImageFile] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        
       
        const imageUrl = data.imagePath ? `http://localhost:8080/${data.imagePath}` : ""; //trocar por env
  
        setUser((prevState) => ({ 
          ...prevState, 
          ...data,
        }));
  
        setSelectedQueueIds(data.queues?.map((queue) => queue.id));
        
        setWhatsappId(data.whatsappId || "");

        setImagePreview(imageUrl || "");
  
        if (imageUrl) {
          const file = await fetchImageAsFile(imageUrl);
          if (file) {
            setImageFile(file);
          }
        }
        
      } catch (err) {
        toastError(err);
      }
    };
  
    fetchUser();
  }, [userId, open]);
  

  const handleImageChange = (imageUrl, file) => {
    
    setImagePreview(imageUrl);
    setImageFile(file);
  };

  const handleImageDelete = () => {
    setImagePreview("");
    setImageFile(null);
  };

  const handleSaveUser = async (values) => {
    const userData = { ...values, whatsappId, queueIds: selectedQueueIds };
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (key === "queueIds" || key === "queues") {
        // Converter array para string JSON antes de adicionar
        formData.append(key, JSON.stringify(userData[key]));
      } else {
        formData.append(key, userData[key]);
      }
    });

    if (formData.has('image')) {
      formData.delete('image');
    }
    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    } 
    try {
      if (userId) {
        const { data : { imagePath: imagePathTwo }} = await api.put(`/users/${userId}`, formData);
      } else {
        await api.post("/users", userData);
      }
      toast.success(i18n.t("userModal.success"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const fetchImageAsFile = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop();
      const file = new File([blob], fileName, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Erro ao buscar a imagem:', error);
      return null;
    }
  };


  const handleClose = (imagePathTwo) => {
    onClose();
    setUser(initialState);
    setImagePreview(imagePathTwo);
    setImageFile(null);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {userId
            ? i18n.t("userModal.title.edit")
            : i18n.t("userModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveUser(values);
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
                    label={i18n.t("userModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="password"
                    variant="outlined"
                    margin="dense"
                    label={i18n.t("userModal.form.password")}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    type={showPassword ? "text" : "password"}
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
                      ),
                    }}
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("userModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                    margin="dense"
                  >
                    <Can
                      role={loggedInUser.profile}
                      perform="user-modal:editProfile"
                      yes={() => (
                        <>
                          <InputLabel id="profile-selection-input-label">
                            {i18n.t("userModal.form.profile")}
                          </InputLabel>

                          <Field
                            as={Select}
                            label={i18n.t("userModal.form.profile")}
                            name="profile"
                            labelId="profile-selection-label"
                            id="profile-selection"
                            required
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                          </Field>
                        </>
                      )}
                    />
                  </FormControl>
                </div>
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() => (
                    <QueueSelect
                      selectedQueueIds={selectedQueueIds}
                      onChange={(values) => setSelectedQueueIds(values)}
                    />
                  )}
                />
                <Can
                  role={loggedInUser.profile}
                  perform="user-modal:editQueues"
                  yes={() =>
                    !loading && (
                      <FormControl
                        variant="outlined"
                        margin="dense"
                        className={classes.maxWidth}
                        fullWidth
                      >
                        <InputLabel>
                          {i18n.t("userModal.form.whatsapp")}
                        </InputLabel>
                        <Field
                          as={Select}
                          value={whatsappId}
                          onChange={(e) => setWhatsappId(e.target.value)}
                          label={i18n.t("userModal.form.whatsapp")}
                        >
                          <MenuItem value={""}>&nbsp;</MenuItem>
                          {whatsApps.map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    )
                  }
                />
                <div className={classes.multFieldLineTwo}>
                  <Field
                    as={UploadButtons}
                    autoFocus
                    error={touched.image && Boolean(errors.image)}
                    helperText={touched.image && errors.image}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    name="imagePath"
                    label={i18n.t("userModal.form.image")}
                    imageFile={imagePreview}
                    onImageChange={handleImageChange}
                    onDelete={handleImageDelete}
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
                  {i18n.t("userModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {userId
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

export default UserModal;
