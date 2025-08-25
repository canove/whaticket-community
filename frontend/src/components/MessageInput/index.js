import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { useParams } from "react-router-dom";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";

import { styled } from '@mui/material/styles';
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import MoodIcon from "@mui/icons-material/Mood";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import ClearIcon from "@mui/icons-material/Clear";
import MicIcon from "@mui/icons-material/Mic";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  Box,
  FormControlLabel,
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

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

// Styled Components
const StyledMainWrapper = styled(Paper)(({ theme }) => ({
  background: "#eee",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  [theme.breakpoints.down('md')]: {
    position: "fixed",
    bottom: 0,
    width: "100%",
  },
}));

const StyledNewMessageBox = styled(Box)(() => ({
  background: "#eee",
  width: "100%",
  display: "flex",
  padding: "7px",
  alignItems: "center",
}));

const StyledMessageInputWrapper = styled(Box)(() => ({
  padding: 6,
  marginRight: 7,
  background: "#fff",
  display: "flex",
  borderRadius: 20,
  flex: 1,
  position: "relative",
}));

const StyledMessageInput = styled(InputBase)(() => ({
  paddingLeft: 10,
  flex: 1,
  border: "none",
}));


const StyledUploadInput = styled("input")(() => ({
  display: "none",
}));

const StyledViewMediaInputWrapper = styled(Paper)(() => ({
  display: "flex",
  padding: "10px 13px",
  position: "relative",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#eee",
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
}));

const StyledEmojiBox = styled(Box)(() => ({
  position: "absolute",
  bottom: 63,
  width: 40,
  borderTop: "1px solid #e8e8e8",
}));

const StyledCircleLoading = styled(CircularProgress)(() => ({
  color: green[500],
  opacity: "70%",
  position: "absolute",
  top: "20%",
  left: "50%",
  marginLeft: -12,
}));

const StyledAudioLoading = styled(CircularProgress)(() => ({
  color: green[500],
  opacity: "70%",
}));

const StyledRecorderWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  alignContent: "middle",
}));

const StyledCancelAudioIcon = styled(HighlightOffIcon)(() => ({
  color: "red",
}));

const StyledSendAudioIcon = styled(CheckCircleOutlineIcon)(() => ({
  color: "green",
}));

const StyledReplyMsgWrapper = styled(Box)(() => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 8,
  paddingLeft: 73,
  paddingRight: 7,
}));

const StyledReplyMsgContainer = styled(Box)(() => ({
  flex: 1,
  marginRight: 5,
  overflowY: "hidden",
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: "7.5px",
  display: "flex",
  position: "relative",
}));

const StyledReplyMsgBody = styled(Box)(() => ({
  padding: 10,
  height: "auto",
  display: "block",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
}));

const StyledReplyContactMsgSideColor = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fromMe'
})(({ fromMe }) => ({
  flex: "none",
  width: "4px",
  backgroundColor: fromMe ? "#6bcbef" : "#35cd96",
}));

const StyledMessageContactName = styled("span")(() => ({
  display: "flex",
  color: "#6bcbef",
  fontWeight: 500,
}));

const StyledMessageQuickAnswersWrapper = styled("ul")(() => ({
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
}));

const MessageInput = ({ ticketStatus }) => {
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
    formData.append("fromMe", true);
    medias.forEach((media) => {
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

  const renderReplyingMessage = (message) => {
    return (
      <StyledReplyMsgWrapper>
        <StyledReplyMsgContainer>
          <StyledReplyContactMsgSideColor fromMe={message.fromMe} />
          <StyledReplyMsgBody>
            {!message.fromMe && (
              <StyledMessageContactName>
                {message.contact?.name}
              </StyledMessageContactName>
            )}
            {message.body}
          </StyledReplyMsgBody>
        </StyledReplyMsgContainer>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
          size="large">
          <ClearIcon sx={{ color: "grey" }} />
        </IconButton>
      </StyledReplyMsgWrapper>
    );
  };

  if (medias.length > 0)
    return (
      <StyledViewMediaInputWrapper elevation={0} square>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={(e) => setMedias([])}
          size="large">
          <CancelIcon sx={{ color: "grey" }} />
        </IconButton>
        {loading ? (
          <div>
            <StyledCircleLoading />
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
          <SendIcon sx={{ color: "grey" }} />
        </IconButton>
      </StyledViewMediaInputWrapper>
    );
  else {
    return (
      <StyledMainWrapper square elevation={0}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <StyledNewMessageBox>
          <Box sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              disabled={loading || recording || ticketStatus !== "open"}
              onClick={(e) => setShowEmoji((prevState) => !prevState)}
              size="large">
              <MoodIcon sx={{ color: "grey" }} />
            </IconButton>
            {showEmoji ? (
              <StyledEmojiBox>
                <ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
                  <Picker
                    perLine={16}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                  />
                </ClickAwayListener>
              </StyledEmojiBox>
            ) : null}

            <StyledUploadInput
              multiple
              type="file"
              id="upload-button"
              disabled={loading || recording || ticketStatus !== "open"}
              onChange={handleChangeMedias}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                disabled={loading || recording || ticketStatus !== "open"}
                size="large">
                <AttachFileIcon sx={{ color: "grey" }} />
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
          </Box>
          <Box sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}>
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleOpenMenuClick}
              size="large">
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
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                  size="large">
                  <MoodIcon sx={{ color: "grey" }} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <StyledUploadInput
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                    size="large">
                    <AttachFileIcon sx={{ color: "grey" }} />
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
          </Box>
          <StyledMessageInputWrapper>
            <StyledMessageInput
              inputRef={(input) => {
                input && input.focus();
                input && (inputRef.current = input);
              }}
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
              onPaste={(e) => {
                ticketStatus === "open" && handleInputPaste(e);
              }}
              onKeyPress={(e) => {
                if (loading || e.shiftKey) return;
                else if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            {typeBar ? (
              <StyledMessageQuickAnswersWrapper>
                {quickAnswers.map((value, index) => {
                  return (
                    <li key={index}>
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a onClick={() => handleQuickAnswersClick(value.message)}>
                        {`${value.shortcut} - ${value.message}`}
                      </a>
                    </li>
                  );
                })}
              </StyledMessageQuickAnswersWrapper>
            ) : (
              <div></div>
            )}
          </StyledMessageInputWrapper>
          {inputMessage ? (
            <IconButton
              aria-label="sendMessage"
              component="span"
              onClick={handleSendMessage}
              disabled={loading}
              size="large">
              <SendIcon sx={{ color: "grey" }} />
            </IconButton>
          ) : recording ? (
            <StyledRecorderWrapper>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
                size="large">
                <StyledCancelAudioIcon />
              </IconButton>
              {loading ? (
                <div>
                  <StyledAudioLoading />
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
                <StyledSendAudioIcon />
              </IconButton>
            </StyledRecorderWrapper>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
              size="large">
              <MicIcon sx={{ color: "grey" }} />
            </IconButton>
          )}
        </StyledNewMessageBox>
      </StyledMainWrapper>
    );
  }
};

export default MessageInput;
