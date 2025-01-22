"use client";

import { useState } from 'react';
import { CONFIG } from 'src/config-global';

import { BlankView } from 'src/sections/blank/view';
import { Upload } from 'src/components/upload';

// ----------------------------------------------------------------------

// export const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function Page() {
   const [uploadedFiles, setUploadedFiles] = useState([]);

   const handleFileUpload = (acceptedFiles) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    console.log('Uploaded files:', acceptedFiles);
  };

  const handleFileRemove = (file) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const handleRemoveAll = () => {
    setUploadedFiles([]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    uploadedFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post('/api/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload successful:', response.data);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  // Logic to upload files to the server, e.g., using axios
  console.log('Uploading files to the server:', uploadedFiles);

  return (
    <div>
      <h1>Dashboard</h1>
      <Upload
        multiple
        value={uploadedFiles}
        onDrop={handleFileUpload}
        onRemove={handleFileRemove}
        onRemoveAll={handleRemoveAll}
        onUpload={handleUpload}
        // helperText="Drag and drop files here or click to select files."
      />
    </div>
  );
}
