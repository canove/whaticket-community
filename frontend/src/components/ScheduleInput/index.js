import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import dayjs from "dayjs";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import MicRecorder from "mic-recorder-to-mp3";
import { useParams } from "react-router-dom";

import {
  Button,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Hidden,
  Menu,
  MenuItem,
  Switch
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CancelIcon from "@material-ui/icons/Cancel";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import MicIcon from "@material-ui/icons/Mic";
import MoodIcon from "@material-ui/icons/Mood";
import MoreVert from "@material-ui/icons/MoreVert";
import SendIcon from "@material-ui/icons/Send";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import RecordingTimer from "../MessageInput/RecordingTimer";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    overflow: "visible",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
  },

  newMessageBox: {
    background: "#eee",
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: "#fff",
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  sendMessageIcons: {
    color: "grey",
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  emojiBox: {
    position: "fixed",
    bottom: 52,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: "#ffffff",
    padding: "2px",
    border: "1px solid #CCC",
    left: 0,
    width: "100%",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "32px",
        "&:hover": {
          background: "#F1F1F1",
          cursor: "pointer",
        },
      },
    },
  },

  schedulePickerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  }
}));

const ScheduleInput = ({ handleCloseModal }) => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const day = dayjs();

  const [date, setDate] = useState(day.format("YYYY-MM-DD"));
  const [time, setTime] = useState(day.format("HH:mm"))
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
    };
  }, [ticketId]);

  const handleSetTime = (e) => {
    const arrayTime = e.target.value.split(":");
    let newHour = Number(arrayTime[0]);
    let newMinute = Number(arrayTime[1]);

    if (date === day.format('YYYY-MM-DD')) {
      if (newHour < day.get("hour")) {
        newHour = dayjs().get("hour");
      }
      if (newHour === day.get("hour") && newMinute < day.get("minute")) {
        newMinute = dayjs().get("minute");
      }
    }

    setTime(`${newHour}:${newMinute < 10 ? "0" + newMinute : newMinute}`);
  }

  const handleChangeInput = (e) => {
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = (value) => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("date", date);
    formData.append("time", time);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/schedule/${ticketId}`, formData);
      handleCloseModal();
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("date", date);
      formData.append("time", time);

      await api.post(`/schedule/${ticketId}`, formData);
      setTimeout(() => handleCloseModal(), 800);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      date,
      time,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
    };
    try {
      await api.post(`/schedule/${ticketId}`, message);
      handleCloseModal();
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    ;
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLoadQuickAnswer = async (value) => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers", {
          params: { searchParam: value.substring(1) },
        });
        setQuickAnswer(data.quickAnswers);
        if (data.quickAnswers.length > 0) {
          setTypeBar(true);
        } else {
          setTypeBar(false);
        }
      } catch (err) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event) => {
    setAnchorEl(null);
  };

  const mediaRender = useMemo(() => (
    <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
      <IconButton
        aria-label="cancel-upload"
        component="span"
        onClick={() => setMedias([])}
      >
        <CancelIcon className={classes.sendMessageIcons} />
      </IconButton>

      {loading ? (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      ) : (
        <span>
          {medias[0]?.name}
        </span>
      )}
      <IconButton
        aria-label="send-upload"
        component="span"
        onClick={handleUploadMedia}
        disabled={loading}
      >
        <SendIcon className={classes.sendMessageIcons} />
      </IconButton>
    </Paper>
  ), [medias.length]);

  const inputRender = useMemo(() => (
    <Paper square elevation={0} className={classes.mainWrapper}>
      <div className={classes.newMessageBox}>
        <Hidden only={["sm", "xs"]}>
          <IconButton
            aria-label="emojiPicker"
            component="span"
            disabled={loading || recording}
            onClick={(e) => setShowEmoji((prevState) => !prevState)}
          >
            <MoodIcon className={classes.sendMessageIcons} />
          </IconButton>
          {showEmoji ? (
            <div className={classes.emojiBox}>
              <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                <Picker
                  perLine={16}
                  showPreview={false}
                  showSkinTones={false}
                  onSelect={handleAddEmoji}
                />
              </ClickAwayListener>
            </div>
          ) : null}

          <input
            multiple
            type="file"
            id="upload-button"
            disabled={loading || recording}
            className={classes.uploadInput}
            onChange={handleChangeMedias}
          />
          <label htmlFor="upload-button">
            <IconButton
              aria-label="upload"
              component="span"
              disabled={loading || recording}
            >
              <AttachFileIcon className={classes.sendMessageIcons} />
            </IconButton>
          </label>
          <FormControlLabel
            style={{ marginRight: 7, color: "gray" }}
            label={i18n.t("messagesInput.signMessage")}
            labelPlacement="start"
            control={
              <Switch
                size="small"
                checked={signMessage}
                onChange={(e) => {
                  setSignMessage(e.target.checked);
                }}
                name="showAllTickets"
                color="primary"
              />
            }
          />
        </Hidden>
        <Hidden only={["md", "lg", "xl"]}>
          <IconButton
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleOpenMenuClick}
          >
            <MoreVert></MoreVert>
          </IconButton>
          <Menu
            id="simple-menu"
            keepMounted
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuItemClick}
          >
            <MenuItem onClick={handleMenuItemClick}>
              <IconButton
                aria-label="emojiPicker"
                component="span"
                disabled={loading || recording}
                onClick={(e) => setShowEmoji((prevState) => !prevState)}
              >
                <MoodIcon className={classes.sendMessageIcons} />
              </IconButton>
            </MenuItem>
            <MenuItem onClick={handleMenuItemClick}>
              <input
                multiple
                type="file"
                id="upload-button"
                disabled={loading || recording}
                className={classes.uploadInput}
                onChange={handleChangeMedias}
              />
              <label htmlFor="upload-button">
                <IconButton
                  aria-label="upload"
                  component="span"
                  disabled={loading || recording}
                >
                  <AttachFileIcon className={classes.sendMessageIcons} />
                </IconButton>
              </label>
            </MenuItem>
            <MenuItem onClick={handleMenuItemClick}>
              <FormControlLabel
                style={{ marginRight: 7, color: "gray" }}
                label={i18n.t("messagesInput.signMessage")}
                labelPlacement="start"
                control={
                  <Switch
                    size="small"
                    checked={signMessage}
                    onChange={(e) => {
                      setSignMessage(e.target.checked);
                    }}
                    name="showAllTickets"
                    color="primary"
                  />
                }
              />
            </MenuItem>
          </Menu>
        </Hidden>
        <div className={classes.messageInputWrapper}>
          <InputBase
            inputRef={(input) => {
              input && input.focus();
              input && (inputRef.current = input);
            }}
            className={classes.messageInput}
            placeholder={i18n.t("messagesInput.placeholderOpen")
            }
            multiline
            maxRows={5}
            value={inputMessage}
            onChange={handleChangeInput}
            disabled={recording || loading}
            onPaste={(e) => handleInputPaste(e)}
            onKeyPress={(e) => {
              if (loading || e.shiftKey) return;
              else if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          {typeBar ? (
            <ul className={classes.messageQuickAnswersWrapper}>
              {quickAnswers.map((value, index) => {
                return (
                  <li
                    className={classes.messageQuickAnswersWrapperItem}
                    key={index}
                  >
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a onClick={() => handleQuickAnswersClick(value.message)}>
                      {`${value.shortcut} - ${value.message}`}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div></div>
          )}
        </div>
        {inputMessage ? (
          <IconButton
            aria-label="sendMessage"
            component="span"
            onClick={handleSendMessage}
            disabled={loading}
          >
            <SendIcon className={classes.sendMessageIcons} />
          </IconButton>
        ) : recording ? (
          <div className={classes.recorderWrapper}>
            <IconButton
              aria-label="cancelRecording"
              component="span"
              fontSize="large"
              disabled={loading}
              onClick={handleCancelAudio}
            >
              <HighlightOffIcon className={classes.cancelAudioIcon} />
            </IconButton>
            {loading ? (
              <div>
                <CircularProgress className={classes.audioLoading} />
              </div>
            ) : (
              <RecordingTimer />
            )}

            <IconButton
              aria-label="sendRecordedAudio"
              component="span"
              onClick={handleUploadAudio}
              disabled={loading}
            >
              <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
            </IconButton>
          </div>
        ) : (
          <IconButton
            aria-label="showRecorder"
            component="span"
            disabled={loading}
            onClick={handleStartRecording}
          >
            <MicIcon className={classes.sendMessageIcons} />
          </IconButton>
        )}
      </div>
    </Paper>
  ), [showEmoji, inputMessage, loading, recording, typeBar, signMessage])

  return (
    <>
      <DialogContent dividers className={classes.schedulePickerWrapper}>
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={day.format("YYYY-MM-DD")}
          />
        </div>

        <div>
          <input
            type="time"
            value={time}
            onChange={handleSetTime}
            min={date === day.format('YYYY-MM-DD') ? dayjs().format("HH:mm") : undefined}
          />
        </div>
      </DialogContent>

      {medias.length > 0 ? mediaRender : inputRender}

      <DialogActions>
        <Button
          onClick={handleCloseModal}
          color="secondary"
          variant="outlined"
        >
          {i18n.t("quickAnswersModal.buttons.cancel")}
        </Button>
      </DialogActions>

    </>
  );
};

export default ScheduleInput;
