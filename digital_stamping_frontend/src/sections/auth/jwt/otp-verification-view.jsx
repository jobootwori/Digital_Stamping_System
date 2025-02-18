'use client';

import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Alert, Box } from '@mui/material';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export function OTPVerification({ onSuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const email = localStorage.getItem('userEmail'); // Retrieve stored email
      if (!email) {
        setError('No email found. Please register again.');
        return;
      }

      const response = await axios.post(
        `${SERVER_URL}/api/auth/verify-otp`,
        { email, otp },
        // { otp_verified: true },
        { headers: { 'Content-Type': 'application/json' } }
        // { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('OTP verified successfully!');

      localStorage.removeItem('accessToken');

      setError('');
      onSuccess();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Check if the backend sent an error message and display it
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
         } else {
        setError('Failed to verify OTP. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <TextField
        label="Enter OTP"
        helperText="Please Enter OTP to Verify Email"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        fullWidth
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
      <Button onClick={handleVerifyOTP} variant="contained" sx={{ mt: 2 }}>
        Verify OTP
      </Button>
    </Box>
  );
}
