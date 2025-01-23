import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Iconify } from '../iconify'; // Ensure this is the correct path

export function Upload({
  placeholder = 'Drag and drop files or click to upload',
  sx,
  multiple = true,
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const stageRef = useRef(null);

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    const newImages = fileList.map((file) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
      return img;
    });
    setUploadedFiles((prev) => [...prev, ...newImages]);
  };

  const handleRemoveAll = () => setUploadedFiles([]);

  return (
    <Box
      sx={{
        width: 800,
        height: 600,
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...sx,
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: 'none' }}
        id="upload-files-input"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
      <label htmlFor="upload-files-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<Iconify icon="eva:cloud-upload-outline" />}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        >
          Upload
        </Button>
      </label>
      {uploadedFiles.length > 0 ? (
        <>
          <Stage width={800} height={600} draggable ref={stageRef}>
            <Layer>
              {uploadedFiles.map((img, index) => (
                <KonvaImage
                  key={index}
                  image={img}
                  x={index * 50}
                  y={index * 50}
                  width={100}
                  height={100}
                  draggable
                />
              ))}
            </Layer>
          </Stage>
          <Stack direction="row" spacing={2} sx={{ position: 'absolute', bottom: 10 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRemoveAll}
              startIcon={<Iconify icon="eva:trash-2-outline" />}
            >
              Remove All
            </Button>
          </Stack>
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {placeholder}
        </Typography>
      )}
    </Box>
  );
}
