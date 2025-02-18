import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Paper,
} from '@mui/material';

// Import your custom icons (adjust the paths as needed)
import ImgIcon from 'public/assets/icons/files/ic-img.svg';
import FileIcon from 'public/assets/icons/files/ic-file.svg';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export default function ViewDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${SERVER_URL}/documents/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocuments(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        My Documents
      </Typography>
      <List>
        {documents.map((doc) => {
          // Determine if the file is an image based on its extension.
          const isImage = doc.file.match(/\.(jpg|jpeg|png|gif)$/i);
          const iconUrl = isImage
            ? '/assets/icons/files/ic-img.svg'
            : '/assets/icons/files/ic-file.svg';

          return (
            <ListItem key={doc.id} divider>
              <ListItemIcon>
                <img src={iconUrl} alt={isImage ? 'Image Icon' : 'File Icon'} width={40} height={40} />
              </ListItemIcon>
              <ListItemText
                primary={`Document ${doc.id}`}
                secondary={`Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}`}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   Typography,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   CircularProgress,
//   Paper,
// } from '@mui/material';

// import ImgIcon from 'src/assets/icons/files/ic-img.svg';
// import FileIcon from 'src/assets/icons/files/ic-document.svg';

// const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// export default function ViewDocuments() {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         const token = localStorage.getItem('accessToken');
//         const response = await axios.get(`${SERVER_URL}/documents/`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setDocuments(response.data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to fetch documents.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, []);

//   if (loading) {
//     return (
//       <Box sx={{ textAlign: 'center', mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Typography color="error" variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
//         {error}
//       </Typography>
//     );
//   }

//   return (
//     <Paper sx={{ p: 4, maxWidth: 600, margin: 'auto' }}>
//       <Typography variant="h5" gutterBottom>
//         My Documents
//       </Typography>
//       <List>
//         {documents.map((doc) => {
//           // Determine file type by extension. You may adjust this check as needed.
//           const isImage = doc.file.match(/\.(jpg|jpeg|png|gif)$/i);
//           const icon = isImage ? <ImgIcon /> : <FileIcon />;
//           return (
//             <ListItem key={doc.id} divider>
//               <ListItemIcon>{icon}</ListItemIcon>
//               <ListItemText
//                 primary={`Document ${doc.id}`}
//                 secondary={`Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}`}
//               />
//             </ListItem>
//           );
//         })}
//       </List>
//     </Paper>
//   );
// }
