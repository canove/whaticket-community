import React, { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutlineOutlined, Edit } from "@material-ui/icons";
import { AiOutlineMessage } from "react-icons/ai";
import TemplateButton from "../../../../components/TemplateButton";

export class ButtonMessageNodeWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      
      buttonModalOpen: false,
      selectedButton: null,
      selectedButtonIndex: "",

      text: props.node.text,
      footer: props.node.footer,
      imageUrl: props.node.imageUrl,
      buttons: props.node.buttons,
    };
  }

  handleButtonsChange = (button, index) => {
    let array = [...this.state.buttons];

    array = array.map((bt, index) => ({ ...bt, id: (1 + index) }));

    if (typeof index === "number") {
      array[index] = { ...button, id: (1 + index) };

      this.setState({ buttons: array });
      this.props.node.buttons = array;
    } else {
      array.push({ ...button, id: (1 + array.length) });
      
      this.setState({ buttons: array });
      this.props.node.buttons = array;
    }
  }

  handleCloseButtonModal = () => {
    this.setState({ buttonModalOpen: false });
    this.setState({ selectedButton: null });
    this.setState({ selectedButtonIndex: "" });
  }

  getButtonInfo = (button) => {
    if (button.type === "quickReplyButton") return button.buttonId;
    if (button.type === "callButton") return button.phoneNumber;
    if (button.type === "urlButton") return button.url;

    return "";
  }

  handleEditButtonModal = (button, index) => {
    this.setState({ selectedButton: button });
    this.setState({ selectedButtonIndex: index });
    this.setState({ buttonModalOpen: true });
  }

  handleDeleteButtonModal = (_, index) => {
    const array = [...this.state.buttons];
    array.splice(index, 1);

    this.setState({ buttons: array });
  }

  render() {
    const { text, footer, imageUrl, buttons } = this.state;
    return (
      <div>
        <TemplateButton
          open={this.state.buttonModalOpen}
          onClose={this.handleCloseButtonModal}
          aria-labelledby="form-dialog-title"
          button={this.state.selectedButton}
          index={this.state.selectedButtonIndex}
          handleButtonsChange={this.handleButtonsChange}
        />
        <Dialog
          open={this.state.modalOpen}
          maxWidth="sm"
          fullWidth
          scroll="paper"
        >
          <DialogTitle id="form-dialog-title">Button Message</DialogTitle>
          <DialogContent>
            <div>
              <TextField
                name="text"
                variant="outlined"
                label="Texto"
                fullWidth
                multiline
                minRows={1}
                value={text}
                onChange={(e) => {
                  this.setState({ text: e.target.value });
                  this.props.node.text = e.target.value;
                }}
              />
            </div>
            <div  style={{ marginTop: "10px" }}>
              <TextField
                name="footer"
                variant="outlined"
                label="Footer"
                fullWidth
                multiline
                minRows={1}
                value={footer}
                onChange={(e) => {
                  this.setState({ footer: e.target.value });
                  this.props.node.footer = e.target.value;
                }}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <TextField
                name="imageUrl"
                variant="outlined"
                label="Image URL"
                fullWidth
                value={imageUrl}
                onChange={(e) => {
                  this.setState({ imageUrl: e.target.value });
                  this.props.node.imageUrl = e.target.value;
                }}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
                style={{ margin: "5px" }}
                onClick={() => {
                  this.setState({ buttonModalOpen: true });
                }}
              >
                Adicionar Botão
              </Button>
            </div>
            { buttons.length > 0 &&
              <Paper variant="outlined">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">{"Texto"}</TableCell>
                        <TableCell align="center">{"Tipo"}</TableCell>
                        <TableCell align="center">{"Extra"}</TableCell>
                        <TableCell align="center">{"Ações"}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        {buttons.map((button, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell align="center">{button.text}</TableCell>
                              <TableCell align="center">{button.type}</TableCell>
                              <TableCell align="center">{this.getButtonInfo(button)}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => this.handleEditButtonModal(button, index)}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => this.handleDeleteButtonModal(button, index)}
                                >
                                  <DeleteOutlineOutlined />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                          })}
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            }
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ modalOpen: false });
              }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #075E54",
            position: "relative",
            width: "250px",
          }}
        >
          <div
            style={{
              backgroundColor: "#25D366",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography
              style={{
                fontWeight: "bold",
                padding: "10px",
              }}
            >
              Button Message
            </Typography>
            <IconButton
              onClick={() => {
                this.setState({ modalOpen: true });
              }}
            >
              <SettingsIcon />
            </IconButton>
          </div>
          <div
            style={{
              minHeight: `110px`,
            }}
          >
            <PortWidget
              style={{
                cursor: "pointer",
                height: "100%",
                left: "0",
                position: "absolute",
                top: "0",
                width: "32px",
              }}
              engine={this.props.engine}
              port={this.props.node.getPort("in")}
            ></PortWidget>

            <PortWidget
              style={{
                backgroundColor: "#25D366",
                border: "2px solid #075E54",
                borderRadius: "100%",
                cursor: "pointer",
                height: "16px",
                position: "absolute",
                right: "-8px",
                top: "calc(50% + 8px)",
                width: "16px",
              }}
              engine={this.props.engine}
              port={this.props.node.getPort("out")}
            ></PortWidget>

            <AiOutlineMessage
              style={{
                display: "block",
                height: "50px",
                position: "absolute",
                right: "calc(50% - 15px)",
                top: "50%",
                width: "50px",
              }}
            />
          </div>
        </div>
        <div
          style={{
            background: "white",
            border: "2px solid #075E54",
            borderTop: "0",
            fontSize: "11px",
            padding: "10px",
          }}
        >
          {this.props.node.options.id}
        </div>
      </div>
    );
  }
}
