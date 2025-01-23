import React, { useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { ChromePicker } from 'react-color';
import * as pdfjsLib from 'pdfjs-dist';

// import { Document, Page, pdfjs } from "react-pdf";
// import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// pdfWorker.GlobalWorkerOptions.workerSrc = pdfWorker;
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js';

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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

  // Handle File Upload
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

  // Load PDF with pdfjs-dist
  const loadPdf = async (pdfData) => {
    const loadedPdf = await pdfjsLib.getDocument(pdfData).promise;
    setPdf(loadedPdf);
    renderPdfPage(loadedPdf, 1); // Render the first page
  };

  // Render a PDF Page
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

  // Add a New Stamp
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

  // Drag and Drop Stamps
  const handleStampDragEnd = (id, e) => {
    const { x, y } = e.target.position();
    setStamps((prevStamps) =>
      prevStamps.map((stamp) => (stamp.id === id ? { ...stamp, x, y } : stamp))
    );
  };

  // Save Stamps
  const saveStamps = () => {
    localStorage.setItem('stamps', JSON.stringify(stamps));
    alert('Stamps saved successfully!');
  };

  // Load Stamps
  const loadStamps = () => {
    const savedStamps = JSON.parse(localStorage.getItem('stamps'));
    if (savedStamps) {
      setStamps(savedStamps);
    } else {
      alert('No saved stamps found!');
    }
  };

  // Render Stamps
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

  // Render Images (PDF Pages or Uploaded Images)
  const renderImages = () =>
    images.map((img, index) => (
      <KonvaImage key={index} image={img} width={800} height={600} />
    ));

  return (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Upload and Manage Documents
      </Typography>

      {/* Upload Button */}
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

      {/* Canvas */}
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

      {/* Zoom Control */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Zoom</Typography>
        <Slider
          value={zoom}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(e, value) => {
            setZoom(value);
            stageRef.current.scale({ x: value, y: value });
            stageRef.current.batchDraw();
          }}
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
            disabled={currentPage === pdf.numPages}
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

      {/* Stamp Customization */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1">Customize Stamp</Typography>
        <ChromePicker color={stampColor} onChangeComplete={(color) => setStampColor(color.hex)} />
        <input
          type="text"
          placeholder="Stamp Text"
          value={stampText}
          onChange={(e) => setStampText(e.target.value)}
          style={{ marginTop: 16, padding: 8, fontSize: 16 }}
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={addStamp}>
          Add Stamp
        </Button>
      </Box>

      {/* Save and Load Stamps */}
      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
        <Button variant="contained" onClick={saveStamps}>
          Save Stamps
        </Button>
        <Button variant="outlined" onClick={loadStamps}>
          Load Stamps
        </Button>
      </Stack>
    </Box>
  );
}



// import { useDropzone } from 'react-dropzone';

// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import FormHelperText from '@mui/material/FormHelperText';

// import { varAlpha } from 'src/theme/styles';

// import { Iconify } from '../iconify';
// import { UploadPlaceholder } from './components/placeholder';
// import { RejectionFiles } from './components/rejection-files';
// import { MultiFilePreview } from './components/preview-multi-file';
// import { DeleteButton, SingleFilePreview } from './components/preview-single-file';

// // ----------------------------------------------------------------------

// export function Upload({
//   sx,
//   value,
//   error,
//   disabled,
//   onDelete,
//   onUpload,
//   onRemove,
//   thumbnail,
//   helperText,
//   onRemoveAll,
//   multiple = false,
//   ...other
// }) {
//   const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
//     multiple,
//     disabled,
//     ...other,
//   });

//   const isArray = Array.isArray(value) && multiple;

//   const hasFile = !isArray && !!value;

//   const hasFiles = isArray && !!value.length;

//   const hasError = isDragReject || !!error;

//   const renderMultiPreview = hasFiles && (
//     <>
//       <MultiFilePreview files={value} thumbnail={thumbnail} onRemove={onRemove} sx={{ my: 3 }} />

//       {(onRemoveAll || onUpload) && (
//         <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
//           {onRemoveAll && (
//             <Button color="inherit" variant="outlined" size="small" onClick={onRemoveAll}>
//               Remove all
//             </Button>
//           )}

//           {onUpload && (
//             <Button
//               size="small"
//               variant="contained"
//               onClick={onUpload}
//               startIcon={<Iconify icon="eva:cloud-upload-fill" />}
//             >
//               Upload
//             </Button>
//           )}
//         </Stack>
//       )}
//     </>
//   );

//   return (
//     <Box sx={{ width: 1, position: 'relative', ...sx }}>
//       <Box
//         {...getRootProps()}
//         sx={{
//           p: 5,
//           outline: 'none',
//           borderRadius: 1,
//           cursor: 'pointer',
//           overflow: 'hidden',
//           position: 'relative',
//           bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
//           border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
//           transition: (theme) => theme.transitions.create(['opacity', 'padding']),
//           '&:hover': { opacity: 0.72 },
//           ...(isDragActive && { opacity: 0.72 }),
//           ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
//           ...(hasError && {
//             color: 'error.main',
//             borderColor: 'error.main',
//             bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
//           }),
//           ...(hasFile && { padding: '28% 0' }),
//         }}
//       >
//         <input {...getInputProps()} />

//         {/* Single file */}
//         {hasFile ? <SingleFilePreview file={value} /> : <UploadPlaceholder />}
//       </Box>

//       {/* Single file */}
//       {hasFile && <DeleteButton onClick={onDelete} />}

//       {helperText && (
//         <FormHelperText error={!!error} sx={{ px: 2 }}>
//           {helperText}
//         </FormHelperText>
//       )}

//       <RejectionFiles files={fileRejections} />

//       {/* Multi files */}
//       {renderMultiPreview}
//     </Box>
//   );
// }
