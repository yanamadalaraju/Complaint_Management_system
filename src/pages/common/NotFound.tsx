import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] px-6">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-[#0c2d67]">404</h1>
        <p className="text-gray-600 mt-3 text-lg">Page not found</p>
        <p className="text-gray-400 text-sm mt-1">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450]"
        >
          <Home size={16} /> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;