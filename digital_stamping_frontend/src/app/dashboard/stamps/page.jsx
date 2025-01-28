"use client";

import { CONFIG } from "src/config-global";
import Stamp from "src/components/stamp/Stamp";

// ----------------------------------------------------------------------

// export const metadata = { title: `Stamp Management | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <div>
      
      <Stamp />
    </div>
  );
}


// "use client";

// import { useState } from 'react';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import MenuItem from '@mui/material/MenuItem';
// import { ChromePicker } from 'react-color';
// import { Stage, Layer, Rect, Circle, Text, Group, Image as KonvaImage } from 'react-konva';

// // ----------------------------------------------------------------------

// // export const metadata = { title: `Stamp Management | Dashboard - CONFIG.site.name` };

// export default function Page() {
//   const [stamps, setStamps] = useState([]);
//   const [currentStamp, setCurrentStamp] = useState({
//     shape: 'rectangle',
//     backgroundColor: '#ff0000',
//     textColor: '#ffffff',
//     text: 'My Stamp',
//     logo: null,
//     timestamp: true,
//     uniqueId: '',
//   });

//   const canvasWidth = 400;
//   const canvasHeight = 200;

//   const handleInputChange = (key, value) => {
//     setCurrentStamp({ ...currentStamp, [key]: value });
//   };

//   const handleAddStamp = () => {
//     const newStamp = {
//       ...currentStamp,
//       uniqueId: `stamp-${Date.now()}`, // Generate a unique ID for the stamp
//     };
//     setStamps([...stamps, newStamp]);
//     alert('Stamp saved successfully!');
//   };

//   const handleDeleteStamp = (id) => {
//     const filteredStamps = stamps.filter((stamp) => stamp.uniqueId !== id);
//     setStamps(filteredStamps);
//     alert('Stamp deleted successfully!');
//   };

//   const renderStampPreview = () => {
//     const { shape, backgroundColor, textColor, text, timestamp, logo } = currentStamp;

//     return (
//       <Stage width={canvasWidth} height={canvasHeight}>
//         <Layer>
//           {/* Shape */}
//           {shape === 'rectangle' && (
//             <Rect width={200} height={100} fill={backgroundColor} cornerRadius={8} />
//           )}
//           {shape === 'circle' && <Circle radius={50} fill={backgroundColor} />}
//           {shape === 'oval' && (
//             <Rect width={200} height={100} fill={backgroundColor} cornerRadius={50} />
//           )}

//           {/* Text */}
//           <Text
//             text={`${text}${timestamp ? ` - ${new Date().toLocaleString()}` : ''}`}
//             fontSize={18}
//             fill={textColor}
//             x={10}
//             y={10}
//             width={200}
//             align="center"
//           />

//           {/* Logo */}
//           {logo && (
//             <KonvaImage
//               image={logo}
//               x={50}
//               y={50}
//               width={50}
//               height={50}
//               cornerRadius={8}
//             />
//           )}
//         </Layer>
//       </Stage>
//     );
//   };

//   const handleLogoUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       const img = new window.Image();
//       img.src = reader.result;
//       img.onload = () => handleInputChange('logo', img);
//     };
//     reader.readAsDataURL(file);
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Stamp Management
//       </Typography>

//       <Stack spacing={3} sx={{ mb: 4 }}>
//         {/* Shape Selection */}
//         <TextField
//           select
//           label="Shape"
//           value={currentStamp.shape}
//           onChange={(e) => handleInputChange('shape', e.target.value)}
//         >
//           <MenuItem value="rectangle">Rectangle</MenuItem>
//           <MenuItem value="circle">Circle</MenuItem>
//           <MenuItem value="oval">Oval</MenuItem>
//         </TextField>

//         {/* Background Color Picker */}
//         <Box>
//           <Typography gutterBottom>Background Color</Typography>
//           <ChromePicker
//             color={currentStamp.backgroundColor}
//             onChangeComplete={(color) => handleInputChange('backgroundColor', color.hex)}
//           />
//         </Box>

//         {/* Text Color Picker */}
//         <Box>
//           <Typography gutterBottom>Text Color</Typography>
//           <ChromePicker
//             color={currentStamp.textColor}
//             onChangeComplete={(color) => handleInputChange('textColor', color.hex)}
//           />
//         </Box>

//         {/* Text Input */}
//         <TextField
//           label="Text"
//           value={currentStamp.text}
//           onChange={(e) => handleInputChange('text', e.target.value)}
//         />

//         {/* Logo Upload */}
//         <Box>
//           <Typography gutterBottom>Upload Logo</Typography>
//           <input type="file" accept="image/*" onChange={handleLogoUpload} />
//         </Box>

//         {/* Real-Time Timestamp Toggle */}
//         <Button
//           variant="contained"
//           onClick={() => handleInputChange('timestamp', !currentStamp.timestamp)}
//         >
//           {currentStamp.timestamp ? 'Disable Timestamp' : 'Enable Timestamp'}
//         </Button>
//       </Stack>

//       {/* Stamp Preview */}
//       <Typography variant="h6" gutterBottom>
//         Stamp Preview
//       </Typography>
//       <Box
//         sx={{
//           width: canvasWidth,
//           height: canvasHeight,
//           border: '1px solid #ccc',
//           marginBottom: 4,
//         }}
//       >
//         {renderStampPreview()}
//       </Box>

//       {/* Save Stamp Button */}
//       <Button variant="contained" onClick={handleAddStamp}>
//         Save Stamp
//       </Button>

//       {/* List of Saved Stamps */}
//       <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
//         My Stamps
//       </Typography>
//       {stamps.length === 0 ? (
//         <Typography>No stamps saved yet.</Typography>
//       ) : (
//         <Stack spacing={2}>
//           {stamps.map((stamp) => (
//             <Box
//               key={stamp.uniqueId}
//               sx={{
//                 p: 2,
//                 border: '1px solid #ccc',
//                 borderRadius: 2,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//               }}
//             >
//               <Typography>{stamp.text}</Typography>
//               <Button
//                 variant="outlined"
//                 color="error"
//                 onClick={() => handleDeleteStamp(stamp.uniqueId)}
//               >
//                 Delete
//               </Button>
//             </Box>
//           ))}
//         </Stack>
//       )}
//     </Box>
//   );
// }
