"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Use "next/navigation" for App Router
import axios from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export default function VerifyPage({ params }) {
  const { serial_number } = params;
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serial_number) return;

    axios.get(`${SERVER_URL}/verify-serial/${serial_number}/`)
      .then(response => {
        setVerificationData(response.data);
      })
      .catch(() => {
        setVerificationData({ valid: false, message: "Invalid or unverified serial number." });
      })
      .finally(() => setLoading(false));
  }, [serial_number]);

  return (
    <Box sx={{ textAlign: "center", p: 4 }}>
      <Typography variant="h5">🔍 Verify Stamped Document</Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 3 }} />
      ) : (
        <Box sx={{ mt: 3, border: "1px solid", padding: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: verificationData.valid ? "green" : "red" }}>
            {verificationData.message}
          </Typography>

          {verificationData.valid && (
            <Box sx={{ mt: 2 }}>
              <Typography>📄 **Serial Number:** {verificationData.serial_number}</Typography>
              <Typography>📅 **Created At:** {new Date(verificationData.created_at).toLocaleString()}</Typography>
              <Typography>👤 **Owner:** {verificationData.owner}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
