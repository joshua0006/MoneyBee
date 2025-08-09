import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Helmet>
          <title>404 Not Found | MoneyBee</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="description" content="The page you are looking for could not be found." />
          <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}${location.pathname}` : '/404'} />
        </Helmet>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
