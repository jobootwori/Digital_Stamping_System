
import React, { useState } from 'react';
import { Stage, Layer, Text, Image as KonvaImage } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useDropzone } from 'react-dropzone';

export function Upload({ sx, ...props }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: true,
    onDrop: (files) => setUploadedFiles((prev) => [...prev, ...files]),
  });

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAll = () => setUploadedFiles([]);

  const handleNextFile = () => {
    if (currentFileIndex < uploadedFiles.length - 1) {
      setCurrentFileIndex((prev) => prev + 1);
    }
  };

  const handlePrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex((prev) => prev - 1);
    }
  };

  const renderCurrentFile = () => {
    if (!uploadedFiles.length) return null;
    const file = uploadedFiles[currentFileIndex];
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    return <KonvaImage image={img} width={800} height={600} />;
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
        }}
      >
        <input {...getInputProps()} />
        <Button variant="contained">Upload Files</Button>
      </Box>

      {uploadedFiles.length > 0 && (
        <>
          <Stage width={800} height={600}>
            <Layer>{renderCurrentFile()}</Layer>
          </Stage>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button onClick={handlePrevFile} disabled={currentFileIndex === 0}>
              Previous
            </Button>
            <Button
              onClick={handleNextFile}
              disabled={currentFileIndex === uploadedFiles.length - 1}
            >
              Next
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleRemoveAll}>
              Remove All
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
