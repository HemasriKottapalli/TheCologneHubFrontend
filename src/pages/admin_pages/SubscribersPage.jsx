import { useEffect, useState } from "react";
import { Trash2, Download, Mail } from "lucide-react";
import API from "../../api";

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch subscribers on load
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/subscribers");
      setSubscribers(res.data);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete subscriber
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subscriber?")) return;

    try {
      await API.get(`/api/subscribers/unsubscribe/${id}`);
      setSubscribers(subscribers.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
    }
  };

  // ✅ Download subscribers
  const handleDownload = async () => {
    try {
      const res = await API.get("/api/subscribers/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "subscribers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download subscribers:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Subscribers</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-2 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#734866] transition text-sm"
        >
          <Download size={18} /> Download Excel
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-gray-500">No subscribers found</p>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="grid gap-3 sm:hidden">
            {subscribers.map((sub) => (
              <div
                key={sub._id}
                className="border rounded-lg p-3 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={16} className="text-gray-500" />
                  <span className="font-medium break-words">{sub.email}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(sub.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="self-end text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-700">
                  <th className="p-3">Email</th>
                  <th className="p-3">Subscribed On</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr
                    key={sub._id}
                    className="border-b hover:bg-gray-50 text-sm"
                  >
                    <td className="p-3 flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      {sub.email}
                    </td>
                    <td className="p-3">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscribersPage;