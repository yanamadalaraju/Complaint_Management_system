import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9] px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 text-red-600">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0c2d67]">
          Access Denied
        </h1>
        <p className="text-gray-600 mt-3">
          You don't have permission to view this page. Please sign in with the
          correct role.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-5 py-2 rounded-lg hover:bg-[#0a2450]"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;