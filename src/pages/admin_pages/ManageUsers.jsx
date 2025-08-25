import { useEffect, useState } from "react";
import { ArrowLeft, Eye, X } from "lucide-react";
import API from "../../api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/getAllUsers");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Handle error state, maybe set an error message
    }
  };

  const fetchUserOrders = async (userId, username) => {
    try {
      const res = await API.get(`/orders/${userId}/orders`);
      setSelectedUserOrders(res.data);
      setSelectedUser({ id: userId, name: username });
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      setSelectedUserOrders([]);
      setSelectedUser({ id: userId, name: username });
      // Handle error state
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      )
    );
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#2C2B2A' }}>
          User Management
        </h2>
        {!selectedUser && (
          <input
            type="text"
            placeholder="Search by username or email..."
            className="border border-gray-300 rounded-full px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#8B5A7C] transition"
            value={searchTerm}
            onChange={handleSearch}
          />
        )}
      </div>

      {/* All Users List */}
      {!selectedUser && filteredUsers.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">All Users</h2>
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <li
                key={user._id}
                className="flex justify-between items-center py-4 px-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => fetchUserOrders(user._id, user.username)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Eye
                  size={20}
                  className="text-[#8B5A7C] flex-shrink-0"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders of Selected User */}
      {selectedUser && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <button
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-[#8B5A7C] transition-colors duration-200"
            onClick={() => setSelectedUser(null)}
          >
            <ArrowLeft size={18} /> Back to Users
          </button>

          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Orders for {selectedUser.name}
          </h2>

          {selectedUserOrders.length === 0 ? (
            <p className="text-gray-500">No orders found for this user.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {selectedUserOrders.map(order => (
                <li
                  key={order._id}
                  className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setCurrentOrder(order);
                    setShowOrderDetails(true);
                  }}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      Order ID: <span className="font-mono text-xs sm:text-sm">{order.orderId}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Status:{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-700 font-semibold text-sm sm:text-base">
                      ${order.total.toFixed(2)}
                    </p>
                    <Eye
                      size={20}
                      className="text-[#8B5A7C] flex-shrink-0"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors duration-200"
              onClick={() => setShowOrderDetails(false)}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Order ID:</strong> <span className="font-mono text-xs sm:text-sm">{currentOrder.orderId}</span></p>
              <p><strong>Status:</strong> {currentOrder.status}</p>
              <p><strong>Total:</strong> ${currentOrder.total.toFixed(2)}</p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {currentOrder.items.map((item, idx) => (
                    <li key={idx} className="text-sm">
                      {item.productName} x {item.quantity} (${item.totalPrice.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;