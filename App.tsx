
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ToastContainer from './components/Toast';

const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
};

export default App;
