import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { UserSync } from './components/UserSync';

function App() {
  return (
    <>
      <UserSync />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
