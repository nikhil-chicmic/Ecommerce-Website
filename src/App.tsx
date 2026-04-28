import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { UserSync } from './components/UserSync';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <UserSync />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
