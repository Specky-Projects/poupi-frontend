import { ReactNode } from 'react';

import { Toaster } from 'react-hot-toast';

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>

      <Toaster />

      {children}

    </div>
  );
}
