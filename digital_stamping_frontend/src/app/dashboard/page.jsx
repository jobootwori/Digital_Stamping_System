"use client";

import { CONFIG } from 'src/config-global';
import { Upload } from 'src/components/upload/upload'; // Import the main upload component
import { UploadBox } from 'src/components/upload/upload-box'; // Import UploadBox
import { UploadAvatar } from 'src/components/upload/upload-avatar'; // Import UploadAvatar
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

// export const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Document and Image Upload
      </Typography>

      {/* Display the UploadAvatar for single uploads */}
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload a Profile Image or Single File
        </Typography>
        <UploadAvatar />
      </Box> */}

      {/* Display the UploadBox for compact file uploads */}
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Upload Box
        </Typography>
        <UploadBox placeholder="Drag and drop files or click to upload" />
      </Box> */}

      {/* Display the Upload component for managing multiple files */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload and Manage Multiple Files
        </Typography>
        <Upload />
      </Box>
    </Box>
  );
}
