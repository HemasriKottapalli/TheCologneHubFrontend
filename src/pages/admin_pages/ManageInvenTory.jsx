import { useState, useEffect } from "react";
import {
  Search,
  Warehouse,
  Edit2,
  Save,
  XCircle,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import API from "../../api";
import BulkManageAndUpdateInventory from "./BulkManageAndUpdateInventory";

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/api/admin/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to fetch products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStockEdit = async (productId) => {
    if (
      !newStockValue.trim() ||
      isNaN(newStockValue) ||
      parseInt(newStockValue) < 0
    ) {
      alert("Please enter a valid stock quantity");
      return;
    }

    setProducts(
      products.map((p) =>
        p.product_id === productId
          ? { ...p, stock_quantity: parseInt(newStockValue) }
          : p
      )
    );

    await updateProductQty(productId);

    setEditingStock(null);
    setNewStockValue("");
  };

  const updateProductQty = async (productId) => {
  let product = products.find((p) => p.product_id === productId);

  product = {...product,stock_quantity: parseInt(newStockValue)}

    try {
      const response = await API.post(
        "http://localhost:7001/api/admin/UpdateProductQty",
        product
      );

      console.log("✅ Product quantity updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error updating product qty:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  const startStockEdit = (product) => {
    setEditingStock(product.product_id);
    setNewStockValue(product.stock_quantity?.toString() || "0");
  };

  const cancelStockEdit = () => {
    setEditingStock(null);
    setNewStockValue("");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const stock = product.stock_quantity || 0;
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "low"
        ? stock <= 10 && stock > 0
        : activeFilter === "out"
        ? stock === 0
        : activeFilter === "good"
        ? stock > 10
        : true;

    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: AlertCircle,
      };
    if (stock <= 10)
      return {
        label: "Low Stock",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: AlertCircle,
      };
    return {
      label: "Good Stock",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: CheckCircle,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center sm:text-left">
          Inventory Management
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            {
              label: "Total Products",
              value: products.length,
              icon: Package,
              color: "text-gray-400",
            },
            {
              label: "Good Stock",
              value: products.filter((p) => (p.stock_quantity || 0) > 10)
                .length,
              icon: CheckCircle,
              color: "text-green-400",
            },
            {
              label: "Low Stock",
              value: products.filter(
                (p) =>
                  (p.stock_quantity || 0) <= 10 && (p.stock_quantity || 0) > 0
              ).length,
              icon: AlertCircle,
              color: "text-orange-400",
            },
            {
              label: "Out of Stock",
              value: products.filter((p) => (p.stock_quantity || 0) === 0)
                .length,
              icon: AlertCircle,
              color: "text-red-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border p-3 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {stat.label}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${stat.color.replace(
                      "text-",
                      "text-"
                    )}`}
                  >
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={stat.color} size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 sm:py-3 border rounded-full text-sm focus:ring-1 focus:ring-[#8B5A7C] outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
            <BulkManageAndUpdateInventory />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {["all", "good", "low", "out"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                  activeFilter === filter
                    ? "bg-[#8B5A7C] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter === "all" && `All (${products.length})`}
                {filter === "good" &&
                  `Good (${
                    products.filter((p) => (p.stock_quantity || 0) > 10).length
                  })`}
                {filter === "low" &&
                  `Low (${
                    products.filter(
                      (p) =>
                        (p.stock_quantity || 0) <= 10 &&
                        (p.stock_quantity || 0) > 0
                    ).length
                  })`}
                {filter === "out" &&
                  `Out (${
                    products.filter((p) => (p.stock_quantity || 0) === 0).length
                  })`}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm border">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Warehouse size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchTerm ? "No products found" : "No products available"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProducts.map((product) => {
                const stock = product.stock_quantity || 0;
                const stockInfo = getStockStatus(stock);
                const Icon = stockInfo.icon;

                return (
                  <div
                    key={product.product_id}
                    className="p-4 sm:px-6 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-3 sm:col-span-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-[#8B5A7C]/10 rounded-lg text-[#8B5A7C] font-bold">
                          {product.name?.[0]?.toUpperCase() || "P"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {product.product_id}
                        </p>
                      </div>
                    </div>

                    {/* Brand + Category */}
                    <div className="sm:col-span-2 text-sm text-gray-700">
                      {product.brand || "N/A"}
                    </div>
                    <div className="sm:col-span-2 text-sm text-gray-700">
                      {product.category || "N/A"}
                    </div>

                    {/* Stock Status */}
                    <div className="sm:col-span-2">
                      <div
                        className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${stockInfo.bgColor} ${stockInfo.color}`}
                      >
                        <Icon size={14} />
                        {stockInfo.label}
                      </div>
                    </div>

                    {/* Stock Quantity + Action */}
                    <div className="flex items-center gap-2 sm:col-span-3">
                      {editingStock === product.product_id ? (
                        <>
                          <input
                            type="number"
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-sm"
                          />
                          <button
                            onClick={() => handleStockEdit(product.product_id)}
                            className="text-green-600"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelStockEdit}
                            className="text-gray-500"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-sm sm:text-base">
                            {stock}
                          </span>
                          <button
                            onClick={() => startStockEdit(product)}
                            className="ml-auto text-gray-600 hover:text-[#8B5A7C]"
                          >
                            <Edit2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;