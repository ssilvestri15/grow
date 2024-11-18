import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Home from './pages/home/Home';
import Landing from './pages/landing/Landing';
import Details from './pages/details/Details';
import CreateCampaign from './pages/create/CreateCampaign';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/project/:id",
    element: <Details />, //Want to pass the address to the Details component
  },
  {
    path: "/create",
    element: <CreateCampaign />, //Want to pass the address to the Details component
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
