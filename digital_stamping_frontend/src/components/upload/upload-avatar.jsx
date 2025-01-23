import React, { useState } from 'react';
import { Stage, Layer, Circle, Image as KonvaImage } from 'react-konva';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Iconify } from '../iconify'; // Ensure this is the correct path to your Iconify component

export function UploadAvatar({ placeholder = 'Upload an avatar', sx }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setUploadedImage(img);
        };
      };
      reader.readAsDataURL(file);
    } else {
      alert('Unsupported file type. Please upload an image.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        width: 200,
        height: 200,
        border: `2px dashed ${dragOver ? '#00f' : '#ccc'}`,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: dragOver ? '#f0f8ff' : '#fff',
        ...sx,
      }}
    >
      {uploadedImage ? (
        <Stage width={200} height={200}>
          <Layer>
            <KonvaImage
              image={uploadedImage}
              x={0}
              y={0}
              width={200}
              height={200}
              clipFunc={(ctx) => {
                ctx.arc(100, 100, 100, 0, Math.PI * 2, false);
              }}
            />
            <Circle x={100} y={100} radius={100} stroke="black" strokeWidth={2} />
          </Layer>
        </Stage>
      ) : (
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <Iconify icon="eva:person-outline" width={48} />
          <Typography variant="body2">{placeholder}</Typography>
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="upload-avatar-input"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        <label htmlFor="upload-avatar-input">
          <Button variant="contained" component="span">
            Upload
          </Button>
        </label>
      </Box>
    </Box>
  );
}
