'use client';
import { CONFIG } from 'src/config-global';

import ViewDocuments from 'src/components/viewDocuments/ViewDocuments';


// ----------------------------------------------------------------------

// export const metadata = { title: `My Documents | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ViewDocuments />;
  
}
