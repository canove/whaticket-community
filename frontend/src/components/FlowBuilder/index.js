import React, { useState } from "react";
import { Box, Paper } from "@mui/material";

const FlowBuilder = () => {
  const [nodes, setNodes] = useState([]);

  const handleDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const rect = e.currentTarget.getBoundingClientRect();
    const newNode = {
      id: Date.now(),
      type,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  return (
    <Box display="flex">
      <Box width={200} mr={2}>
        <Paper
          draggable
          onDragStart={e => e.dataTransfer.setData("type", "message")}
          style={{ padding: 16, marginBottom: 8 }}
        >
          Message Node
        </Paper>
      </Box>
      <Box
        flex={1}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: "1px solid #ccc", minHeight: 400, position: "relative" }}
      >
        {nodes.map(node => (
          <Paper
            key={node.id}
            style={{ position: "absolute", left: node.x, top: node.y, padding: 8 }}
          >
            {node.type}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FlowBuilder;
