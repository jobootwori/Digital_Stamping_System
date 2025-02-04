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
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!token) {
        setError('User is not logged in.');
        return;
      }

      const response = await axios.post(
        `${SERVER_URL}/verify-otp/`,
        { otp_code: otp },
        // { otp_verified: true },
        // { headers: { 'Content-Type': 'application/json' } }
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('OTP verified successfully!');
      setError('');
      onSuccess();
    } catch (error) {
      if (error.response?.data?.code === 'token_not_valid') {
        try {
          // Refresh the token
          const refreshResponse = await axios.post(
            `${SERVER_URL}/refresh-token/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the original request with the new access token
          const retryResponse = await axios.post(
            `${SERVER_URL}/verify-otp/`,
            { otp_code: otp },
            { headers: { Authorization: `Bearer ${newAccessToken}` } }
          );

          setSuccess('OTP verified successfully!');
          setError('');
          onSuccess();
        } catch (refreshError) {
          setError('Failed to refresh token. Please log in again.');
          console.error('Error refreshing token:', refreshError);
        }
      } else {
        setError('Failed to verify OTP. Please try again.');
        console.error('Error verifying OTP:', error);
      }
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <TextField label="Enter OTP" helperText="Please Enter OTP to Verify Email" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth />
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
