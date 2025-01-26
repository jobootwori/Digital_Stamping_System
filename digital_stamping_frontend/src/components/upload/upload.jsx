
import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { ChromePicker } from 'react-color';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState([]);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef();
  const [stamps, setStamps] = useState([]);
  const [stampColor, setStampColor] = useState('#ff0000');
  const [stampText, setStampText] = useState('My Stamp');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith('image/')) {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => setImages([img]);
      } else if (file.type === 'application/pdf') {
        loadPdf(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadPdf = async (pdfData) => {
    const loadedPdf = await pdfjsLib.getDocument(pdfData).promise;
    setPdf(loadedPdf);
    renderPdfPage(loadedPdf, 1);
  };

  const renderPdfPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });

    const canvasElement = document.createElement('canvas');
    canvasElement.width = viewport.width;
    canvasElement.height = viewport.height;

    const context = canvasElement.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;

    const img = new window.Image();
    img.src = canvasElement.toDataURL();
    img.onload = () => setImages([img]);
  };

  const addStamp = () => {
    const newStamp = {
      id: stamps.length + 1,
      x: 100,
      y: 100,
      text: stampText,
      color: stampColor,
    };
    setStamps((prevStamps) => [...prevStamps, newStamp]);
  };

  const handleStampDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    setStamps((prevStamps) =>
      prevStamps.map((stamp) => (stamp.id === id ? { ...stamp, x, y } : stamp))
    );
  };

  const renderStamps = () =>
    stamps.map((stamp) => (
      <Group
        key={stamp.id}
        draggable
        x={stamp.x}
        y={stamp.y}
        onDragEnd={(e) => handleStampDragEnd(stamp.id, e)}
      >
        <Rect width={100} height={50} fill={stamp.color} cornerRadius={5} />
        <Text
          text={stamp.text}
          fontSize={16}
          width={100}
          height={50}
          align="center"
          verticalAlign="middle"
          fill="white"
        />
      </Group>
    ));

  const renderImages = () =>
    images.map((img, index) => (
      <KonvaImage key={index} image={img} width={800} height={600} />
    ));

  const downloadCanvasAsImage = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'stamped-document.png';
    link.href = uri;
    link.click();
  };

  const downloadCanvasAsPDF = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const pdf = new jsPDF('landscape', 'px', [800, 600]);
    pdf.addImage(uri, 'PNG', 0, 0, 800, 600);
    pdf.save('stamped-document.pdf');
  };

  return (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Upload and Manage Documents
      </Typography>

      <input
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        id="upload-input"
        onChange={handleFileChange}
      />
      <label htmlFor="upload-input">
        <Button variant="contained" component="span">
          Upload Document
        </Button>
      </label>

      <Stage
        width={800}
        height={600}
        ref={stageRef}
        style={{
          border: '1px solid #ccc',
          margin: '16px auto',
          display: 'block',
        }}
        draggable
      >
        <Layer>
          {renderImages()}
          {renderStamps()}
        </Layer>
      </Stage>

      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
        <Button variant="contained" onClick={downloadCanvasAsImage}>
          Download as Image
        </Button>
        <Button variant="contained" onClick={downloadCanvasAsPDF}>
          Download as PDF
        </Button>
      </Stack>
    </Box>
  );
}


