
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Text } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export function UploadAvatar() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [stamps, setStamps] = useState([]);
  const stageRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false,
    onDrop: (files) => handleFileUpload(files[0]),
  });

  const handleFileUpload = (file) => {
    if (file.type === 'application/pdf') {
      renderPDF(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setUploadedImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPDF = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      
      const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) => {
          const page = await pdf.getPage(i + 1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          return canvas;
        })
      );
      setUploadedPDF(pages);
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleAddStamp = () => {
    const newStamp = {
      id: Date.now(),
      x: 50,
      y: 50,
      shape: 'rect', // or 'circle'
      color: '#ff0000',
      text: 'Custom Stamp',
    };
    setStamps((prev) => [...prev, newStamp]);
  };

  const handleDeleteStamp = (id) => {
    setStamps((prev) => prev.filter((stamp) => stamp.id !== id));
  };

  const renderStamps = stamps.map((stamp) => {
    if (stamp.shape === 'circle') {
      return (
        <Circle
          key={stamp.id}
          x={stamp.x}
          y={stamp.y}
          radius={30}
          fill={stamp.color}
          draggable
          onDragEnd={(e) => {
            const { x, y } = e.target.position();
            setStamps((prev) =>
              prev.map((s) => (s.id === stamp.id ? { ...s, x, y } : s))
            );
          }}
          onDblClick={() => handleDeleteStamp(stamp.id)}
        />
      );
    }
    return (
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
            prev.map((s) => (s.id === stamp.id ? { ...s, x, y } : s))
          );
        }}
        onDblClick={() => handleDeleteStamp(stamp.id)}
      />
    );
  });

  const renderDocument = () => {
    if (uploadedPDF && pdfPages.length) {
      const page = pdfPages[currentPage - 1];
      return (
        <KonvaImage
          image={page}
          x={0}
          y={0}
          width={stageRef.current.width()}
          height={stageRef.current.height()}
        />
      );
    } else if (uploadedImage) {
      return (
        <KonvaImage
          image={uploadedImage}
          x={0}
          y={0}
          width={stageRef.current.width()}
          height={stageRef.current.height()}
        />
      );
    }
    return null;
  };

  return (
    <Box>
      <Box {...getRootProps()} sx={{ border: '2px dashed #ccc', p: 4, textAlign: 'center' }}>
        <input {...getInputProps()} />
        <Typography variant="h6">Drag and drop a file or click to upload</Typography>
      </Box>

      {uploadedImage || uploadedPDF ? (
        <>
          <Stage
            width={800}
            height={600}
            draggable
            ref={stageRef}
            scaleX={zoom}
            scaleY={zoom}
            x={0}
            y={0}
            onWheel={(e) => {
              e.evt.preventDefault();
              const scaleBy = 1.1;
              const oldScale = stageRef.current.scaleX();
              const pointer = stageRef.current.getPointerPosition();
              const mousePointTo = {
                x: (pointer.x - stageRef.current.x()) / oldScale,
                y: (pointer.y - stageRef.current.y()) / oldScale,
              };
              const newScale =
                e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
              stageRef.current.scale({ x: newScale, y: newScale });
              const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
              };
              stageRef.current.position(newPos);
              stageRef.current.batchDraw();
            }}
          >
            <Layer>{renderDocument()}</Layer>
            <Layer>{renderStamps}</Layer>
          </Stage>

          {uploadedPDF && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous Page
              </Button>
              <Button
                disabled={currentPage === pdfPages.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next Page
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Zoom</Typography>
            <Slider
              value={zoom}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(e, value) => setZoom(value)}
            />
          </Box>

          <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddStamp}>
            Add Stamp
          </Button>
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No document or image uploaded yet.
        </Typography>
      )}
    </Box>
  );
}
