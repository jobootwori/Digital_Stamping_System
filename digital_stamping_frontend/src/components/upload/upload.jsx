import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Text, Group } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { ChromePicker } from 'react-color';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
// import { PDFDocument } from 'pdf-lib';

// const pdf = await PDFDocument.load(pdfBytes);
// const page = await pdf.getPage(pageNum);

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [images, setImages] = useState([]);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef();
  const [stamps, setStamps] = useState([]);
  const [myStamps, setMyStamps] = useState([]);
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

  // Render a PDF Page using pdf.js
  const renderPdfPage = async (pdf, pageNum) => {
    if (pageNum < 1 || pageNum > pdf.numPages) {
      console.error('Invalid page request:', pageNum);
      return;
    }
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

  // Fetch Stamps from the Database
  const fetchMyStamps = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(`${SERVER_URL}/stamps/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setMyStamps(response.data);
        console.log(response.data)
      }
    } catch (error) {
      console.error('Error fetching saved stamps:', error);
    }
  };

  useEffect(() => {
    fetchMyStamps();
  }, []);

  // Add a Stamp from "My Stamps" to the Canvas
  const addStampToCanvas = (stamp) => {
    const newStamp = {
      id: stamps.length + 1,
      x: 100,
      y: 100,
      text: stamp.text,
      subText: stamp.sub_text,
      color: stamp.color,
      textColor: stamp.text_color,
      shape: stamp.shape,
      size: parseInt(stamp.size, 10) || 50, // Ensure size is a numbersize: stamp.size,
    };
    setStamps((prevStamps) => [...prevStamps, newStamp]);
  };

  // Drag-and-Drop Stamps
  const handleStampDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    setStamps((prevStamps) =>
      prevStamps.map((stamp) => (stamp.id === id ? { ...stamp, x, y } : stamp))
    );
  };

  const renderStamps = () =>
    stamps.map((stamp) => {
      const fontSizeMain = (stamp.size || 50) * 0.3; // Dynamic font size for main text
    const fontSizeSub = (stamp.size || 50) * 0.2; // Dynamic font size for subtext
    const totalTextHeight = fontSizeMain + fontSizeSub; // Total height of both texts
      return (
        <Group
          key={stamp.id}
          draggable
          x={stamp.x}
          y={stamp.y}
          onDragEnd={(e) => handleStampDragEnd(stamp.id, e)}
        >
        {/* Render shape (circle or rectangle) */}
      {stamp.shape === 'circle' && (
        <Circle
          x={50}
          y={50}
          radius={stamp.size || 50}
          fill={stamp.color}
          stroke={stamp.textColor || '#000000'}
          strokeWidth={4}
        />
      )}
      {stamp.shape === 'rectangle' && (
        <Rect
          x={0}
          y={0}
          width={stamp.size || 100}
          height={stamp.size || 50}
          fill={stamp.color}
          stroke={stamp.textColor || '#000000'}
          strokeWidth={4}
          cornerRadius={5}
        />
      )}

      {/* Render main text */}
      <Text
        x={-stamp.size / 2 || -50}
        y={-totalTextHeight / 2}
        text={stamp.text}
        fontSize={fontSizeMain} // Scale font size based on stamp size
        width={stamp.size * 2 || 100}
        align="center"
        verticalAlign="middle"
        fill={stamp.textColor || '#ffffff'}
      />

      {/* Render subtext */}
      {stamp.subText && (
        <Text
          x={-stamp.size / 2 || -50}
          y={fontSizeMain - totalTextHeight / 2}
          text={stamp.subText}
          fontSize={fontSizeSub} // Scale subtext font size
          width={stamp.size * 2 || 100}
          align="center"
          verticalAlign="middle"
          fill={stamp.textColor || '#ffffff'}
        />
      )}
      </Group>
    )});

  // Add Stamp from "My Stamps" Library
  const addStampFromLibrary = (stamp) => {
    const newStamp = {
      id: stamps.length + 1,
      x: 100,
      y: 100,
      text: stamp.text,
      color: stamp.color,
    };
    setStamps((prevStamps) => [...prevStamps, newStamp]);
  };

  const renderImages = () =>
    images.map((img, index) => <KonvaImage key={index} image={img} width={800} height={600} />);

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

      {/* Canvas for PDF and Stamps */}
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        draggable
        style={{
          border: '1px solid #ccc',
          margin: '16px auto',
          display: 'block',
        }}
      >
        <Layer>
          {images.map((img, index) => (
            <KonvaImage key={index} image={img} width={800} height={600} />
          ))}
          {renderStamps()}
        </Layer>
      </Stage>

      {/* Zoom Slider */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Zoom</Typography>
        <Slider
          value={zoom}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(e, value) => setZoom(value)}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Pagination */}
      {pdf && (
        <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              renderPdfPage(pdf, newPage);
            }}
          >
            Previous Page
          </Button>
          <Button
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              renderPdfPage(pdf, newPage);
            }}
          >
            Next Page
          </Button>
        </Stack>
      )}

      {/* "My Stamps" Library */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">My Stamps</Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, justifyContent: 'center', overflowX: 'auto', py: 2 }}
        >
          {myStamps.map((stamp) => (
            <Box
              key={stamp.id}
              sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                padding: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Stamp Preview */}
              <Stage width={100} height={100}>
                <Layer>
                  {stamp.shape === 'circle' ? (
                    <Circle
                      x={50}
                      y={50}
                      radius={stamp.size || 50}
                      fill={stamp.color || '#000'}
                      stroke={stamp.text_color || '#fff'}
                      strokeWidth={2}
                    />
                  ) : (
                    <Rect
                      x={25}
                      y={25}
                      width={stamp.size * 2 || 50}
                      height={stamp.size || 50}
                      fill={stamp.color || '#000'}
                      stroke={stamp.text_color || '#fff'}
                      strokeWidth={2}
                    />
                  )}
                  <Text
                    x={0}
                    y={40}
                    width={100}
                    text={stamp.text}
                    fontSize={12}
                    align="center"
                    fill={stamp.text_color || '#fff'}
                  />
                  <Text
                    x={0}
                    y={60}
                    width={100}
                    text={stamp.sub_text}
                    fontSize={10}
                    align="center"
                    fill={stamp.text_color || '#fff'}
                  />
                </Layer>
              </Stage>
              {/* Add Stamp Button */}
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => addStampToCanvas(stamp)}
              >
                Add Stamp
              </Button>
            </Box>

            // <Button key={stamp.id} variant="outlined" onClick={() => addStampFromLibrary(stamp)}>
            //   {stamp.text}
            // </Button>
          ))}
        </Stack>
      </Box>

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
