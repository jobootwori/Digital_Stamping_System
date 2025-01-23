import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import * as pdfjsLib from 'pdfjs-dist';


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export function UploadBox({ placeholder = 'Drag and drop an image or PDF here', sx }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'pdf'
  const [images, setImages] = useState([]); // Images for PDFs or single image
  const [currentPage, setCurrentPage] = useState(1); // Current page for PDFs
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  const stageRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (file) => {
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : null;

    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          setImages([img]);
          setFileType('image');
        };
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'pdf') {
      renderPDF(file);
      setFileType('pdf');
    } else {
      alert('Unsupported file format. Please upload an image or PDF.');
    }
  };

  // Render PDF pages using PDF.js
  const renderPDF = async (file) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      setTotalPages(pdf.numPages);

      const renderPage = async (pageNum) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const img = new window.Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
          setImages([img]);
        };
      };

      await renderPage(1); // Render the first page by default
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      renderPDFPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      renderPDFPage(currentPage - 1);
    }
  };

  const renderPDFPage = async (pageNum) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdf = await pdfjsLib.getDocument(pdfData).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const img = new window.Image();
      img.src = canvas.toDataURL();
      img.onload = () => {
        setImages([img]);
      };
    };
    fileReader.readAsArrayBuffer(uploadedFile);
  };

  // Zoom controls
  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
    stageRef.current.scale({ x: newValue, y: newValue });
    stageRef.current.batchDraw();
  };

  // Drag-and-drop handlers
  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    setUploadedFile(file);
    handleFileUpload(file);
  };

  const handleDragOver = (event) => event.preventDefault();
  const handleDragLeave = () => setDragOver(false);

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        width: 800,
        height: 600,
        border: `2px dashed ${dragOver ? '#00f' : '#ccc'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        bgcolor: dragOver ? '#f0f8ff' : '#fff',
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          gap: 1,
        }}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          id="upload-input"
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
        <label htmlFor="upload-input">
          <Button variant="contained" component="span">
            Upload File
          </Button>
        </label>
      </Box>

      {images.length > 0 ? (
        <>
          <Stage
            ref={stageRef}
            width={800}
            height={600}
            draggable
            style={{ border: '1px solid #ccc' }}
          >
            <Layer>
              {images.map((img, index) => (
                <KonvaImage
                  key={index}
                  x={0}
                  y={0}
                  image={img}
                  width={800}
                  height={600}
                />
              ))}
            </Layer>
          </Stage>
          {fileType === 'pdf' && (
            <Box sx={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={handlePreviousPage} disabled={currentPage <= 1}>
                Previous Page
              </Button>
              <Button variant="contained" onClick={handleNextPage} disabled={currentPage >= totalPages}>
                Next Page
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {placeholder}
        </Typography>
      )}

      {/* Zoom Controls */}
      <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 200 }}>
        <Typography variant="caption">Zoom</Typography>
        <Slider
          value={zoom}
          onChange={handleZoomChange}
          min={0.5}
          max={3}
          step={0.1}
        />
      </Box>
    </Box>
  );
}