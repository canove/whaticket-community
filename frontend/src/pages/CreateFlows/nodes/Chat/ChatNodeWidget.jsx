import React, { useEffect, useState } from "react";
import parse, { attributesToProps } from 'html-react-parser';

import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { PortWidget } from '@projectstorm/react-diagrams';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";

import { AdvancedPortModel } from '../../ports/AdvancedPort/AdvancedPortModel';

export class ChatNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  count: 0,
		  modalOpen: false,
		  editorState: this.props.node.data.content ? EditorState.createWithContent(convertFromRaw(JSON.parse(this.props.node.data.content))) : EditorState.createEmpty(),
		};
	}

	onEditorStateChange = async (editorState) => {
		this.setState({
		  editorState,
		});

		const data = convertToRaw(editorState.getCurrentContent());

		this.props.node.data.content = JSON.stringify(data);
	};

	render() {
		const { editorState } = this.state;

		const wrapperStyle = {
			border: "1px solid black",
		}
		const editorStyle = {
			minHeight: '300px',
			padding: '1rem',
			cursor: 'text',
		}

		return (
			<div>
				<Dialog
					open={this.state.modalOpen}
					maxWidth="sm"
					fullWidth
					scroll="paper"
				>
				<DialogTitle id="form-dialog-title">
					Chat
				</DialogTitle>
				<DialogContent>
					<Editor
						wrapperStyle={wrapperStyle}
						editorStyle={editorStyle}
						editorState={editorState}
						onEditorStateChange={this.onEditorStateChange}
					/>
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
						width: "300px",
					}}
				>
					<div 
						style={{
							backgroundColor: "#25D366",
							color: "white",
							display: "flex",
							justifyContent: "space-between"
						}}
					>
						<Typography style={{
								fontWeight: "bold",
								padding: "10px",
							}}
						>
							Chat
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
							minHeight: "150px",
						}}
					>
						<PortWidget
							style={{
								cursor: "pointer",
								height: "48px",
								left: "0",
								position: "absolute",
								top: "0",
								width: "8px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('in')}
						>
						</PortWidget>
						<div
							style={{
								backgroundColor: "#EEE",
								border: "1px solid black",
								margin: "8px",
								minHeight: "150px",
								padding: "16px",
							}}
						>
							{ parse(draftToHtml(convertToRaw(editorState.getCurrentContent())),
								{
									replace: domNode => {
										if (domNode.attribs && domNode.name === 'img') {
										const props = attributesToProps(domNode.attribs);
										return <img {...props} draggable="false" />;
										}
									}
								})
							}
						</div>
							<PortWidget
								style={{
									backgroundColor: "#25D366",
									border: "2px solid #075E54",
									borderRadius: "100%",
									cursor: "pointer",
									height: "16px",
									position: "absolute",
									right: "-8px",
									top: "50%",
									width: "16px",
								}}
								engine={this.props.engine}
								port={this.props.node.getPort('out')}
							>
							</PortWidget>
						{/* { Object.keys(this.props.node.ports).map((port, index) => (
							<PortWidget
							key={index}
							style={{
								backgroundColor: "black",
								border: "1px solid white",
								bottom: `calc(50px * ${index})`,
								height: "50px",
								position: "absolute",
								right: "0",
								width: "75px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort(port)}
						>
							<div style={{
									backgroundColor: "green",
									border: "1px solid white",
									height: "50px",
									width: "75px",
								}}
							>
								{port}
							</div>
						</PortWidget>
						))} */}
						{/* <PortWidget
							style={{
								bottom: "50px",
								height: "50px",
								position: "absolute",
								right: "0",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-true')}
						>
							<div style={{
									backgroundColor: "green",
									height: "50px",
									width: "50px",
								}}
							>
								True
							</div>
						</PortWidget>
						<PortWidget
							style={{
								bottom: "0",
								height: "50px",
								position: "absolute",
								right: "0",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-false')}
						>
							<div style={{
									backgroundColor: "red",
									height: "50px",
									width: "50px",
								}}
							>
								False
							</div>
						</PortWidget> */}
					</div>
				</div>
			</div>
		);
	}
}
