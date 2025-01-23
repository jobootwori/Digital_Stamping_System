
import React, { useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useDropzone } from 'react-dropzone';

export function UploadBox({ placeholder = 'Upload a document or image', sx }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [stamps, setStamps] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: true,
    onDrop: (files) => setUploadedFiles((prev) => [...prev, ...files]),
  });

  const addStamp = () => {
    const newStamp = {
      id: Date.now(),
      x: 50,
      y: 50,
      text: 'Stamp Text',
      color: 'red',
    };
    setStamps((prev) => [...prev, newStamp]);
  };

  return (
    <Box sx={{ ...sx }}>
      <Box
        {...getRootProps()}
        sx={{
          width: 400,
          height: 200,
          border: '2px dashed #ccc',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body2">{placeholder}</Typography>
      </Box>

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Uploaded Files:</Typography>
          {uploadedFiles.map((file, index) => (
            <Typography key={index} variant="body2">
              {file.name}
            </Typography>
          ))}
          <Stage width={800} height={600}>
            <Layer>
              {uploadedFiles.map((file, index) => (
                <KonvaImage
                  key={index}
                  image={URL.createObjectURL(file)}
                  width={800}
                  height={600}
                />
              ))}
              {stamps.map((stamp) => (
                <Rect
                  key={stamp.id}
                  x={stamp.x}
                  y={stamp.y}
                  width={100}
                  height={50}
                  fill={stamp.color}
                  draggable
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setStamps((prev) =>
                      prev.map((s) =>
                        s.id === stamp.id ? { ...s, x, y } : s
                      )
                    );
                  }}
                />
              ))}
            </Layer>
          </Stage>
          <Button onClick={addStamp} sx={{ mt: 2 }}>
            Add Stamp
          </Button>
        </Box>
      )}
    </Box>
  );
}
