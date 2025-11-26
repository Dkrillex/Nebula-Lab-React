
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from 'react-hot-toast';
import { CURRENT_SYSTEM, SYSTEM_TYPE } from './constants';

const App: React.FC = () => {
  useEffect(() => {
    const title =
      CURRENT_SYSTEM === SYSTEM_TYPE.MODEL_CENTER ? 'Nebula API' : 'Nebula Lab';
    document.title = title;
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
