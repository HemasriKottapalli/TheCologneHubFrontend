import { useState } from "react";
import { Download, Upload, FileSpreadsheet, X } from "lucide-react";
import API from "../../api";

const BulkManageAndUpdateInventory = () => {
  const [openModal, setOpenModal] = useState(null); // "upload" | "update" | "inventory" | null
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/api/Bulkproducts/upload", formData);
      setMessage(
        res.data.message +
          ` | Inserted: ${res.data.inserted}, Updated: ${res.data.updated}`
      );
    } catch (err) {
      setMessage(
        "Upload failed. " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDownload = async () => {
    try {
      const res = await API.get("/api/Bulkproducts/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setMessage("Download failed. " + err.message);
    }
  };

  return (
    <div className="p-0">
      {/* Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setOpenModal("update")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            openModal === "update"
              ? "bg-[#8B5A7C] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileSpreadsheet size={18} /> Bulk Update
        </button>
        <button
          onClick={handleDownload}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            openModal === "inventory"
              ? "bg-[#8B5A7C] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Download size={18} /> Download Inventory
        </button>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-[500px] p-6 relative">
            {/* Close */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setOpenModal(null);
                setMessage("");
                setFile(null);
              }}
            >
              <X size={20} />
            </button>

            {openModal === "update" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#8B5A7C]">
                  Bulk Update Products
                </h2>
                <p className="text-sm text-gray-600">
                  Download current products, update them in Excel, then re-upload.
                </p>

                {/* Download button */}
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8B5A7C] text-white rounded-lg shadow hover:bg-[#734866] text-sm sm:text-base"
                >
                  <Download size={18} /> Download Current Products
                </button>

                {/* File input + Upload button (stack on mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="text-sm"
                  />
                  <button
                    onClick={handleUpload}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8B5A7C] text-white rounded-lg shadow hover:bg-[#734866] text-sm sm:text-base"
                  >
                    <Upload size={18} /> Re-Upload Updated File
                  </button>
                </div>

                {message && (
                  <p className="text-sm text-green-600 break-words">{message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkManageAndUpdateInventory;