import { useEffect, useState, useRef } from "react";
import { ChevronDown, Eye, X, Printer, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import API from "../../api";

const ManageOrders = () => {
  const [counts, setCounts] = useState({
    "All(non-delivered)": 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  const invoiceRef = useRef();
  const handlePrint = useReactToPrint({ content: () => invoiceRef.current });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const fetchCounts = async () => {
    try {
      const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "All(non-delivered)",
        "delivered",
        "cancelled",
      ];
      const results = await Promise.all(
        statuses.map((status) =>
          status === "All(non-delivered)"
            ? API.get(`/orders/non-delivered`)
            : API.get(`/orders/status/${status}`)
        )
      );
      const newCounts = {};
      statuses.forEach(
        (status, i) => (newCounts[status] = results[i].data.length)
      );
      setCounts(newCounts);
    } catch (err) {
      console.error("Error fetching counts", err);
    }
  };

  const fetchOrders = async (status) => {
    if (status === "download") return;
    setLoading(true);
    try {
      const res =
        status === "All(non-delivered)"
          ? await API.get(`/orders/non-delivered`)
          : await API.get(`/orders/status/${status}`);
      let data = res.data;
      data.sort((a, b) =>
        sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/orders/${id}/status`, { newStatus });
      fetchCounts();
      if (activeTab) fetchOrders(activeTab);
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    if (activeTab) fetchOrders(activeTab);
  }, [sortOrder, activeTab]);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(query) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(query)
    );
  });

  const downloadExcel = async (url, filename) => {
    try {
      const res = await API.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setError("");
    } catch (err) {
      console.error("Error downloading file", err);
      setError("No Data Found");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2C2B2A] mb-6">Manage Orders</h2>

      {/* Status Buttons */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {Object.keys(counts).map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === status
                  ? "bg-[#8B5A7C] text-white shadow-md"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(status);
                fetchOrders(status);
                setSearchQuery("");
              }}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            activeTab === "download"
              ? "bg-[#8B5A7C] text-white shadow-md"
              : "bg-white text-gray-700 border hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("download")}
        >
          <Download className="w-4 h-4" /> Download
        </button>
      </div>

      {/* Download Section */}
      {activeTab === "download" && (
        <div className="bg-white shadow-xl rounded-xl p-6 border mb-6">
          <h3 className="text-lg font-semibold mb-4">Download Orders</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() =>
                downloadExcel("/orders/export/today", "today_orders.xlsx")
              }
              className="bg-[#8B5A7C] text-white px-4 py-2 rounded-lg shadow hover:bg-[#713B63] transition"
            >
              Download Today’s Orders
            </button>
            <p className="font-medium text-gray-600">Or</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border px-3 py-2 rounded-lg"
              />
              <button
                onClick={() =>
                  selectedDate &&
                  downloadExcel(
                    `/orders/export/date/${selectedDate}`,
                    `orders_${selectedDate}.xlsx`
                  )
                }
                disabled={!selectedDate}
                className={`px-4 py-2 rounded-lg shadow transition ${
                  selectedDate
                    ? "bg-[#8B5A7C] text-white hover:bg-[#713B63]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Download by Date
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
          )}
        </div>
      )}

      {/* Orders Section */}
      {activeTab !== "download" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
            <button
              className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              Sort: {sortOrder === "asc" ? "Oldest First" : "Newest First"}
              <ChevronDown className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Search by Order ID or Username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#8B5A7C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-gray-500">No matching orders found</p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{order.orderId}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-gray-600">${order.total}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      {Object.keys(statusColors).map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full sm:w-3/4 max-w-3xl p-4 relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="absolute top-3 left-3 flex items-center gap-2 bg-[#8B5A7C] text-white px-3 py-1 rounded shadow hover:bg-white hover:text-[#8B5A7C]"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>

            <div ref={invoiceRef} className="space-y-6 mt-6 p-2">
              <h2 className="text-2xl font-bold text-center mb-4">
                Order Invoice
              </h2>

              {/* Shipping + Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="truncate">
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="truncate">
                    {selectedOrder.shippingAddress?.address}
                  </p>
                  <p className="truncate">
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state}
                  </p>
                  <p className="truncate">
                    {selectedOrder.shippingAddress?.zipCode},{" "}
                    {selectedOrder.shippingAddress?.country}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment Info</h3>
                  <p>Method: {selectedOrder.paymentMethod}</p>
                  <p>Status: {selectedOrder.paymentStatus}</p>
                  <p>ID: {selectedOrder.paymentId}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="w-full text-sm border-collapse border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border text-left">Product</th>
                      <th className="p-2 border text-center">Qty</th>
                      <th className="p-2 border text-right">Price</th>
                      <th className="p-2 border text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-2 border truncate max-w-xs">
                          {item.productName}
                        </td>
                        <td className="p-2 border text-center">
                          {item.quantity}
                        </td>
                        <td className="p-2 border text-right">${item.price}</td>
                        <td className="p-2 border text-right">
                          ${item.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-sm space-y-1">
                <p>Subtotal: ${selectedOrder.subtotal}</p>
                <p>Discount: ${selectedOrder.promoDiscount}</p>
                <p>Shipping: ${selectedOrder.shipping}</p>
                <p>Tax: ${selectedOrder.tax}</p>
                <p className="font-bold">Total: ${selectedOrder.total}</p>
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Order Date:{" "}
                  {new Date(selectedOrder.orderDate).toLocaleString()}
                </p>
                <p>
                  Estimated Delivery:{" "}
                  {new Date(selectedOrder.estimatedDelivery).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;