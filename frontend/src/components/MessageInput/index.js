import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import clsx from "clsx";

import makeStyles from '@mui/styles/makeStyles';
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import { Paperclip as AttachFileIcon, MoreVertical as MoreVert, Smile as MoodIcon, Send as SendIcon, XCircle as CancelIcon, X as ClearIcon, Mic as MicIcon, CheckCircle2 as CheckCircleOutlineIcon, XCircle as HighlightOffIcon } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import {
  FormControlLabel,
  Hidden,
  Menu,
  MenuItem,
  Switch,
} from "@mui/material";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

let Mp3Recorder = null;

const initRecorder = async () => {
  if (!Mp3Recorder) {
    try {
      const MicRecorder = (await import("mic-recorder-to-mp3")).default;
      Mp3Recorder = new MicRecorder({ bitRate: 128 });
    } catch (error) {
      console.error("Failed to initialize recorder:", error);
      return null;
    }
  }
  return Mp3Recorder;
};

const useStyles = makeStyles(theme => ({
  mainWrapper: {
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid #E5E9EF",
    [theme.breakpoints.down('md')]: {
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
  },

  newMessageBox: {
    background: "#ffffff",
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: "#F7F8FA",
    display: "flex",
    borderRadius: 11,
    flex: 1,
    position: "relative",
    border: "1px solid #E5E9EF",
    "&:focus-within": {
      borderColor: "#25D366",
      boxShadow: "0 0 0 3px rgba(37,211,102,0.10)",
    },
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 14,
  },

  sendMessageIcons: {
    color: "#9BA3B0",
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
    backgroundColor: "#ffffff",
    borderTop: "1px solid #E5E9EF",
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #E5E9EF",
  },

  circleLoading: {
    color: "#25D366",
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: "#25D366",
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "#EF4444",
  },

  sendAudioIcon: {
    color: "#25D366",
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
    backgroundColor: "#25D366",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#25D366",
  },

  messageContactName: {
    display: "flex",
    color: "#25D366",
    fontWeight: 600,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: "#ffffff",
    padding: "2px",
    border: "1px solid #E5E9EF",
    borderRadius: 11,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
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
        fontFamily: '"DM Sans", system-ui, sans-serif',
        "&:hover": {
          background: "rgba(37,211,102,0.06)",
          cursor: "pointer",
        },
      },
    },
  },
}));

const MessageInput = ({ ticketStatus }) => {
  const classes = useStyles();
  const { ticketId } = useParams();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
    };
  }, [ticketId, setReplyingMessage]);

  const quickAnswerDebounceRef = useRef(null);

  const handleChangeInput = e => {
    const value = e.target.value;
    setInputMessage(value);

    if (quickAnswerDebounceRef.current) clearTimeout(quickAnswerDebounceRef.current);
    quickAnswerDebounceRef.current = setTimeout(() => {
      handleLoadQuickAnswer(value);
    }, 300);
  };

  const handleQuickAnswersClick = value => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = e => {
    let emoji = e.native;
    setInputMessage(prevState => prevState + emoji);
  };

  const handleChangeMedias = e => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = e => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async e => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach(media => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLoadQuickAnswer = async value => {
    if (value && value.indexOf("/") === 0) {
      try {
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: inputMessage.substring(1) },
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

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const recorder = await initRecorder();
      if (!recorder) {
        throw new Error("Recorder not available");
      }
      const [, blob] = await recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      const recorder = await initRecorder();
      if (recorder) {
        await recorder.stop().getMp3();
      }
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = event => {
    setAnchorEl(null);
  };

  const renderReplyingMessage = message => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            {!message.fromMe && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}
            {message.body}
          </div>
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
          size="large">
          <ClearIcon size={18} className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={e => setMedias([])}
          size="large">
          <CancelIcon size={18} className={classes.sendMessageIcons} />
        </IconButton>

        {loading ? (
          <div>
            <CircularProgress className={classes.circleLoading} />
          </div>
        ) : (
          <span>
            {medias[0]?.name}
            {/* <img src={media.preview} alt=""></img> */}
          </span>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
          size="large">
          <SendIcon className={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <Paper square elevation={0} className={classes.mainWrapper}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <div className={classes.newMessageBox}>
          <Hidden only={["sm", "xs"]}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              disabled={loading || recording || ticketStatus !== "open"}
              onClick={e => setShowEmoji(prevState => !prevState)}
              size="large">
              <MoodIcon size={18} className={classes.sendMessageIcons} />
            </IconButton>
            {showEmoji ? (
              <div className={classes.emojiBox}>
                <ClickAwayListener onClickAway={e => setShowEmoji(false)}>
                  <Picker
                    data={data}
                    perLine={16}
                    previewPosition="none"
                    skinTonePosition="none"
                    onEmojiSelect={handleAddEmoji}
                  />
                </ClickAwayListener>
              </div>
            ) : null}

            <input
              multiple
              type="file"
              id="upload-button"
              disabled={loading || recording || ticketStatus !== "open"}
              className={classes.uploadInput}
              onChange={handleChangeMedias}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                disabled={loading || recording || ticketStatus !== "open"}
                size="large">
                <AttachFileIcon size={18} className={classes.sendMessageIcons} />
              </IconButton>
            </label>
            <FormControlLabel
              style={{ marginRight: 7, color: "#9BA3B0" }}
              label={i18n.t("messagesInput.signMessage")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={signMessage}
                  onChange={e => {
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
              size="large">
              <MoreVert size={18} />
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
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={e => setShowEmoji(prevState => !prevState)}
                  size="large">
                  <MoodIcon size={18} className={classes.sendMessageIcons} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticketStatus !== "open"}
                  className={classes.uploadInput}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                    size="large">
                    <AttachFileIcon size={18} className={classes.sendMessageIcons} />
                  </IconButton>
                </label>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <FormControlLabel
                  style={{ marginRight: 7, color: "#9BA3B0" }}
                  label={i18n.t("messagesInput.signMessage")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={signMessage}
                      onChange={e => {
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
              inputRef={input => {
                input && input.focus();
                input && (inputRef.current = input);
              }}
              className={classes.messageInput}
              placeholder={
                ticketStatus === "open"
                  ? i18n.t("messagesInput.placeholderOpen")
                  : i18n.t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={inputMessage}
              onChange={handleChangeInput}
              disabled={recording || loading || ticketStatus !== "open"}
              onPaste={e => {
                ticketStatus === "open" && handleInputPaste(e);
              }}
              onKeyPress={e => {
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
              size="large">
              <SendIcon size={18} className={classes.sendMessageIcons} />
            </IconButton>
          ) : recording ? (
            <div className={classes.recorderWrapper}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
                size="large">
                <HighlightOffIcon size={18} className={classes.cancelAudioIcon} />
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
                size="large">
                <CheckCircleOutlineIcon size={18} className={classes.sendAudioIcon} />
              </IconButton>
            </div>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
              size="large">
              <MicIcon size={18} className={classes.sendMessageIcons} />
            </IconButton>
          )}
        </div>
      </Paper>
    );
  }
};

export default MessageInput;
