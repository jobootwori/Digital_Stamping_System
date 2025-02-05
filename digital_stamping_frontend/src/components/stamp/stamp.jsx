import axios from 'axios';
import { ChromePicker } from 'react-color';
import { useState, useEffect } from 'react';
import { Stage, Layer, Text, Circle, Path } from 'react-konva';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const Stamp = () => {
  const [text, setText] = useState('PAID');
  const [subText, setSubText] = useState('THANK YOU');
  const [color, setColor] = useState('#ff0000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [shape, setShape] = useState('circle');
  const [size, setSize] = useState(120);
  const [x, setX] = useState(200); // Initial X position
  const [y, setY] = useState(200); // Initial Y position
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedStamps, setSavedStamps] = useState([]);
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  

  const width = 400;
  const height = 400;

  const handleSaveStamp = async () => {
    const stampData = {
      text,
      sub_text: subText,
      color,
      text_color: textColor,
      shape,
      size,
      x,
      y,
    };

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setErrorMessage('User is not logged in. Please log in first.');
        return;
      }
      const response = await axios.post(`${SERVER_URL}/stamps/create/`, stampData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
        },
      });

      if (response.status === 201) {
        setSuccessMessage('Stamp saved successfully!');
        setErrorMessage('');
        fetchSavedStamps(); // Refresh saved stamps
      } else {
        setErrorMessage('Failed to save stamp. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error saving stamp:', error);
      setErrorMessage('An error occurred while saving the stamp.');
      setSuccessMessage('');
    }
  };
  const fetchSavedStamps = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // console.log('This should be the access token:', localStorage.getItem('access'));

      if (!token) {
        console.error('User is not logged in. Cannot fetch stamps.');
        return;
      }

      const response = await axios.get(`${SERVER_URL}/stamps/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
        },
      });

      if (response.status === 200) {
        setSavedStamps(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved stamps:', error);
    }
  };

  useEffect(() => {
    fetchSavedStamps();
  }, []);

  if (!isVerified || !isOtpVerified) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorMessage || 'You must verify your email and complete OTP verification to create a stamp.'}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/verify-otp')}>
          Verify Now
        </Button>
      </Box>
    );
  }

  const handleClear = () => {
    setText('PAID');
    setSubText('THANK YOU');
    setColor('#ff0000');
    setTextColor('#ffffff');
    setShape('circle');
    setSize(120);
    setX(200); // Reset X position
    setY(200); // Reset Y position
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Stamp Creator
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ width: '100%', maxWidth: 400 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Controls for Stamp Customization */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <TextField
          label="Main Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
        />
        <TextField
          label="Sub Text"
          value={subText}
          onChange={(e) => setSubText(e.target.value)}
          fullWidth
        />
        <Typography variant="subtitle1">Background Color</Typography>
        <ChromePicker color={color} onChangeComplete={(newColor) => setColor(newColor.hex)} />
        <Typography variant="subtitle1">Text Color</Typography>
        <ChromePicker
          color={textColor}
          onChangeComplete={(newTextColor) => setTextColor(newTextColor.hex)}
        />
        <TextField
          select
          label="Shape"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          fullWidth
        >
          <MenuItem value="circle">Circle</MenuItem>
          <MenuItem value="rectangle">Rectangle</MenuItem>
        </TextField>
        <Typography variant="subtitle1">Size</Typography>
        <Slider
          value={size}
          min={50}
          max={200}
          step={10}
          onChange={(e, value) => setSize(value)}
          valueLabelDisplay="auto"
        />
      </Box>

      {/* Stamp Preview */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid #ccc',
          padding: 2,
          borderRadius: 2,
          backgroundColor: '#f5f5f5',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Preview
        </Typography>
        <Stage
          width={width}
          draggable
          height={height}
          style={{ backgroundColor: '#fff', borderRadius: 8 }}
          onDragEnd={(e) => {
            setX(e.target.x());
            setY(e.target.y());
          }}
        >
          <Layer>
            {shape === 'circle' && (
              <Circle
                x={x}
                y={y}
                radius={size}
                fill={color}
                stroke={textColor}
                strokeWidth={4}
              />
            )}
            {shape === 'rectangle' && (
              <Path
                data={`M${x - size} ${y - size} H${x + size} V${y + size} H${x - size} Z`}
                fill={color}
                stroke={textColor}
                strokeWidth={4}
              />
            )}
            <Text
              x={width / 2 - size}
              y={height / 2 - 20}
              width={size * 2}
              align="center"
              text={text}
              fontSize={20}
              fill={textColor}
              fontStyle="bold"
            />
            <Text
              x={width / 2 - size}
              y={height / 2 + 10}
              width={size * 2}
              align="center"
              text={subText}
              fontSize={14}
              fill={textColor}
            />
          </Layer>
        </Stage>
      </Box>
      {/* Saved Stamps */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Saved Stamps</Typography>
        <ul>
          {savedStamps.map((stamp) => (
            <li key={stamp.id}>
              {stamp.text} - {stamp.sub_text} ({stamp.shape})
            </li>
          ))}
        </ul>
      </Box>
      {/* Action Buttons */}
      <Box sx={{ mt: 4, width: '100%', maxWidth: 400 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" color="primary" size="large" onClick={handleSaveStamp}>
            Save Stamp
          </Button>
          <Button variant="outlined" color="secondary" size="large" onClick={handleClear}>
            Clear
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Stamp;
