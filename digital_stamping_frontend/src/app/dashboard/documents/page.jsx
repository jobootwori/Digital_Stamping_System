import { CONFIG } from 'src/config-global';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

export const metadata = { title: `My Documents | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <BlankView title="My Documents" />;
  
}
