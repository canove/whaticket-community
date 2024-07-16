import React, { useContext, useEffect, useRef, useState } from "react";

import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import { IconButton, InputAdornment } from "@material-ui/core";

import Step from "@material-ui/core/Step";
import StepContent from "@material-ui/core/StepContent";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import Switch from "@material-ui/core/Switch";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Colorize } from "@material-ui/icons";
import CreateOutlinedIcon from "@material-ui/icons/CreateOutlined";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import { UsersPresenceContext } from "../../context/UsersPresenceContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import CategorySelect from "../CategorySelect";
import ColorPicker from "../ColorPicker";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
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
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
});

const ChatbotOptionList = ({
  fatherChatbotOptionId,
  chatbotOptionsFromProps,
  queueId,
}) => {
  const [chatbotOptions, setChatbotOptions] = useState([]);
  const [subChatbotOptions, setSubChatbotOptions] = useState([]);
  const [activeChatbotOptionIndex, setActiveChatbotOptionIndex] =
    useState(null);
  const [activeChatbotOption, setActiveChatbotOption] = useState(null);

  useEffect(() => {
    if (chatbotOptionsFromProps) {
      setChatbotOptions(chatbotOptionsFromProps);
    }
  }, [chatbotOptionsFromProps]);

  useEffect(() => {
    if (!activeChatbotOption) {
      return;
    }

    (async () => {
      try {
        const { data } = await api.get(
          `/chatbotOption/${activeChatbotOption.id}`
        );

        if (!data) {
          toastError("No se encontró la opción de chatbot");
        }

        setSubChatbotOptions((oldSubChatbotoptions) => [
          ...data.chatbotOptions,
          ...[{ name: "Agregar Opción", message: "", isAddMoreOption: true }],
        ]);
      } catch (err) {
        console.log("---- err", err);
        toastError(err);
      }
    })();
  }, [activeChatbotOption]);

  return (
    <Stepper
      activeStep={activeChatbotOptionIndex}
      nonLinear
      orientation="vertical"
    >
      {chatbotOptions.map((chatbotOption, chatbotOptionIndex) => (
        <Step
          key={chatbotOption.name}
          onClick={() => {
            if (chatbotOption.isTextField) {
              return;
            }

            // Add text field
            if (chatbotOption.isAddMoreOption) {
              const newTextFieldElement = {
                isTextField: true,
              };

              setChatbotOptions((oldChatbotOptions) => {
                const newChatbotOptions = [...oldChatbotOptions];

                if (newChatbotOptions.length === 1) {
                  newChatbotOptions.unshift(newTextFieldElement);
                  return newChatbotOptions;
                }

                if (newChatbotOptions.length > 1) {
                  newChatbotOptions.splice(
                    newChatbotOptions.length - 1,
                    0,
                    newTextFieldElement
                  );
                  return newChatbotOptions;
                }
              });

              return;
            }

            setActiveChatbotOptionIndex(chatbotOptionIndex);
            setActiveChatbotOption(chatbotOption);
          }}
        >
          <StepLabel style={{ cursor: "pointer" }}>
            {chatbotOption.isTextField ? (
              <ChatbotOptionTextField
                queueId={queueId}
                fatherChatbotOptionId={fatherChatbotOptionId}
                chatbotOption={chatbotOption}
                onDelete={(id) => {
                  setChatbotOptions((oldChatbotOptions) => {
                    const newChatbotOptions = [...oldChatbotOptions];
                    newChatbotOptions.splice(id, 1);
                    return newChatbotOptions;
                  });
                }}
                onSave={(newChatbotOption) => {
                  setChatbotOptions((oldChatbotOptions) => {
                    const newChatbotOptions = [...oldChatbotOptions];
                    newChatbotOptions.splice(
                      chatbotOptionIndex,
                      1,
                      newChatbotOption
                    );
                    return newChatbotOptions;
                  });
                }}
              />
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <div>{chatbotOption.name}</div>

                {!chatbotOption.isAddMoreOption && (
                  <div>
                    <CreateOutlinedIcon
                      onClick={() => {
                        setChatbotOptions((oldChatbotOptions) => {
                          const newChatbotOptions = [...oldChatbotOptions];

                          newChatbotOptions.splice(chatbotOptionIndex, 1, {
                            ...chatbotOption,
                            isTextField: true,
                          });

                          return newChatbotOptions;
                        });
                      }}
                    />
                    <DeleteOutlineOutlinedIcon
                      onClick={async () => {
                        try {
                          await api.delete(
                            `/chatbotOption/${chatbotOption.id}`
                          );
                          setChatbotOptions((oldChatbotOptions) => {
                            const newChatbotOptions = [...oldChatbotOptions];
                            newChatbotOptions.splice(chatbotOptionIndex, 1);
                            return newChatbotOptions;
                          });
                          setActiveChatbotOptionIndex(false);
                          toast.success("Opcion eliminada correctamente");
                        } catch (err) {
                          toastError(err);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </StepLabel>
          <StepContent>
            {!chatbotOption.isTextField && !chatbotOption.isAddMoreOption && (
              <>
                <div>RESPUESTA: {chatbotOption.message}</div>

                <ChatbotOptionList
                  fatherChatbotOptionId={chatbotOption.id}
                  chatbotOptionsFromProps={subChatbotOptions}
                  queueId={queueId}
                />
              </>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
};

const ChatbotOptionTextField = ({
  queueId,
  chatbotOption,
  fatherChatbotOptionId,
  onDelete,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (chatbotOption) {
      setName(chatbotOption.name);
      setMessage(chatbotOption.message);
    }
  }, [chatbotOption]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          label="Nombre"
          helperText="Campo obligatorio"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Respuesta"
          helperText="Campo obligatorio"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <SaveOutlinedIcon
        onClick={async () => {
          console.log({ chatbotOption, name, message, fatherChatbotOptionId });

          // return;

          try {
            if (chatbotOption.id) {
              const updatedChatbotOption = await api.put(
                `/chatbotOption/${chatbotOption.id}`,
                {
                  ...chatbotOption,
                  name,
                  message,
                }
              );
              onSave(updatedChatbotOption.data);
            } else {
              const newChatbotOption = await api.post("/chatbotOption", {
                name,
                message,
                queueId,
                fatherChatbotOptionId,
              });

              onSave(newChatbotOption.data);
            }
            toast.success("Departamento guardado correctamente");
          } catch (err) {
            toastError(err);
          }
        }}
      />
      <DeleteOutlineOutlinedIcon onClick={() => onDelete(chatbotOption.id)} />
    </div>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const QueueModal = ({ open, onClose, queueId, queuesCategories }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [chatbotOptions, setChatbotOptions] = useState([
    { name: "Agregar Opción", message: "", isAddMoreOption: true },
  ]);
  const [tabValue, setTabValue] = useState(0);
  const [queueAutomaticAssignment, setQueueAutomaticAssignment] =
    useState(false);
  const [
    queueAutomaticAssignmentForOfflineUsers,
    setQueueAutomaticAssignmentForOfflineUsers,
  ] = useState(false);
  const [users, setUsers] = useState([]);
  const greetingRef = useRef();
  const { connectedUsers } = useContext(UsersPresenceContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users/", {});

        setUsers(data.users);
      } catch (err) {
        toastError(err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (queuesCategories) {
      setSelectedCategoryIds(queuesCategories.map((category) => category.id));
    }
  }, [queuesCategories]);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);

        console.log("queue", data);

        setQueueAutomaticAssignment(
          data.automaticAssignment ? data.automaticAssignment : false
        );
        setQueueAutomaticAssignmentForOfflineUsers(
          data.automaticAssignmentForOfflineUsers
            ? data.automaticAssignmentForOfflineUsers
            : false
        );

        setQueue((prevState) => {
          return { ...prevState, ...data };
        });

        if (data.chatbotOptions && data.chatbotOptions.length > 0) {
          setChatbotOptions((oldChatbotOptions) => [
            ...data.chatbotOptions,
            { name: "Agregar Opción", message: "", isAddMoreOption: true },
          ]);
        } else {
          setChatbotOptions([
            { name: "Agregar Opción", message: "", isAddMoreOption: true },
          ]);
        }
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
      });
    };
  }, [queueId, open]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleSaveQueue = async (values) => {
    const queueData = { ...values, categoriesIds: selectedCategoryIds };

    delete queueData["chatbotOptions"];

    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, queueData);
      } else {
        await api.post("/queue", values);
      }
      toast.success("Queue saved successfully");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        scroll="paper"
      >
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          centered
        >
          <Tab label="DEPARTAMENTO" />
          <Tab label="USUARIOS Y ASIGNACIÓN" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <>
            {/* <DialogTitle>
              {queueId
                ? `${i18n.t("queueModal.title.edit")}`
                : `${i18n.t("queueModal.title.add")}`}
            </DialogTitle> */}
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values }) => (
                <Form>
                  <DialogContent dividers>
                    <Field
                      as={TextField}
                      label={i18n.t("queueModal.form.name")}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      className={classes.textField}
                    />
                    <Field
                      as={TextField}
                      label={i18n.t("queueModal.form.color")}
                      name="color"
                      id="color"
                      onFocus={() => {
                        setColorPickerModalOpen(true);
                        greetingRef.current.focus();
                      }}
                      error={touched.color && Boolean(errors.color)}
                      helperText={touched.color && errors.color}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: values.color }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setColorPickerModalOpen(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                      variant="outlined"
                      margin="dense"
                    />
                    <ColorPicker
                      open={colorPickerModalOpen}
                      handleClose={() => setColorPickerModalOpen(false)}
                      onChange={(color) => {
                        values.color = color;
                        setQueue(() => {
                          return { ...values, color };
                        });
                      }}
                    />
                    <div>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        type="greetingMessage"
                        multiline
                        inputRef={greetingRef}
                        rows={5}
                        fullWidth
                        name="greetingMessage"
                        error={
                          touched.greetingMessage &&
                          Boolean(errors.greetingMessage)
                        }
                        helperText={
                          touched.greetingMessage && errors.greetingMessage
                        }
                        variant="outlined"
                        margin="dense"
                      />
                    </div>
                    <CategorySelect
                      selectedCategoryIds={selectedCategoryIds}
                      onChange={(values) => setSelectedCategoryIds(values)}
                    />

                    <ChatbotOptionList
                      fatherChatbotOptionId={null}
                      chatbotOptionsFromProps={chatbotOptions}
                      queueId={queueId}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      color="secondary"
                      disabled={isSubmitting}
                      variant="outlined"
                    >
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.btnWrapper}
                    >
                      {queueId
                        ? `${i18n.t("queueModal.buttons.okEdit")}`
                        : `${i18n.t("queueModal.buttons.okAdd")}`}
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
          </>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DialogContent dividers>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                <h3 style={{ marginBottom: 0 }}>
                  Habilitar asignación automática
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ marginTop: 0 }}>
                    Al habilitar esta opción, se asignará automáticamente cada
                    nuevo chat a un miembro del equipo.
                  </p>
                  <Switch
                    checked={queueAutomaticAssignment ? true : false}
                    onChange={async (e) => {
                      try {
                        const { data } = await api.put(`/queue/${queueId}`, {
                          ...queue,
                          automaticAssignment: e.target.checked,
                        });

                        setQueueAutomaticAssignment(data.automaticAssignment);
                      } catch (err) {
                        toastError(err);
                      }
                    }}
                    color="primary"
                    inputProps={{ "aria-label": "primary checkbox" }}
                  />
                </div>
              </div>
              <div
                style={{
                  marginBottom: "1.5rem",
                  opacity: queueAutomaticAssignment ? "1" : "0.5",
                }}
              >
                <h3 style={{ marginBottom: 0 }}>
                  Asignar a usuarios fuera de línea
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ marginTop: 0 }}>
                    Al habilitar esta opción, se asignará chats a los miembros
                    disponibles y no disponibles del equipo.
                  </p>
                  <Switch
                    disabled={queueAutomaticAssignment ? false : true}
                    checked={queueAutomaticAssignmentForOfflineUsers}
                    onChange={async (e) => {
                      try {
                        const { data } = await api.put(`/queue/${queueId}`, {
                          ...queue,
                          automaticAssignmentForOfflineUsers: e.target.checked,
                        });

                        setQueueAutomaticAssignmentForOfflineUsers(
                          data.automaticAssignmentForOfflineUsers
                        );
                      } catch (err) {
                        toastError(err);
                      }
                    }}
                    color="primary"
                    inputProps={{ "aria-label": "primary checkbox" }}
                  />
                </div>
              </div>

              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">
                      {i18n.t("contacts.table.name")}
                    </TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">
                      Asignar usuario al departamento
                    </TableCell>
                    <TableCell align="center">
                      Asignar chats automáticamente
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell align="center">
                          {connectedUsers.find((id) => id === user.id)
                            ? "🟢"
                            : "🟡"}
                        </TableCell>
                        <TableCell align="center">{user.name}</TableCell>
                        <TableCell align="center">{user.email}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={
                              queue?.users?.filter((u) => u.id === user.id)
                                .length > 0
                                ? true
                                : false
                            }
                            onChange={async (e) => {
                              let queueUsersIds = queue?.users?.map(
                                (u) => u.id
                              );

                              try {
                                const { data } = await api.post(
                                  `/queueUser/${queue.id}`,
                                  {
                                    userIds: e.target.checked
                                      ? [...queueUsersIds, user.id]
                                      : queueUsersIds.filter(
                                          (u) => u !== user.id
                                        ),
                                  }
                                );
                                setQueue(data);
                              } catch (err) {
                                toastError(err);
                              }
                            }}
                            color="primary"
                            inputProps={{ "aria-label": "primary checkbox" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            disabled={queueAutomaticAssignment ? false : true}
                            checked={
                              queue.users?.filter((u) => u.id === user.id)?.[0]
                                ?.UserQueue?.automaticallyAssign
                                ? true
                                : false
                            }
                            onChange={async (e) => {
                              try {
                                const { data } = await api.put(
                                  `/queueUser/${queue.id}`,
                                  {
                                    userId: user.id,
                                    automaticallyAssign: e.target.checked
                                      ? true
                                      : false,
                                  }
                                );
                                console.log(data);
                                setQueue(data);
                              } catch (err) {
                                toastError(err);
                              }
                            }}
                            color="primary"
                            inputProps={{ "aria-label": "primary checkbox" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </TabPanel>
      </Dialog>
    </div>
  );
};

export default QueueModal;
