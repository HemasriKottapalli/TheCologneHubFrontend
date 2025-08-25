// import React, { useState } from 'react';
// import { Truck, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';

// function ShippingForm({ onSubmit, onBack, loading }) {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     addressLine1: '',
//     addressLine2: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'United States'
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // Format phone number as user types
//     if (name === 'phone') {
//       const cleaned = value.replace(/[^0-9]/g, '');
//       let formatted = cleaned;
//       if (cleaned.length > 3 && cleaned.length <= 6) {
//         formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
//       } else if (cleaned.length > 6) {
//         formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
//       }
//       setFormData(prev => ({
//         ...prev,
//         [name]: formatted
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
//     else if (formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters';
    
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
//       newErrors.phone = 'Invalid US phone number (use format: (555) 123-4567)';
//     }
    
//     if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 is required';
//     if (!formData.city.trim()) newErrors.city = 'City is required';
//     else if (formData.city.length < 2) newErrors.city = 'City must be at least 2 characters';
    
//     if (!formData.state.trim()) newErrors.state = 'State is required';
    
//     if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
//     else if (!/^\d{5}$/.test(formData.zipCode)) {
//       newErrors.zipCode = 'ZIP code must be exactly 5 digits';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateForm()) {
//       onSubmit(formData);
//     }
//   };

//   const usStates = [
//     'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
//     'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
//     'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
//     'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
//     'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
//     'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
//     'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
//     'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
//     'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
//     'West Virginia', 'Wisconsin', 'Wyoming'
//   ];

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6">
//       <div className="mb-6">
//         <div className="flex items-center gap-2 mb-2">
//           <Truck className="w-5 h-5 text-[#8B5A7C]" />
//           <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
//         </div>
//         <p className="text-gray-600">Please provide your US delivery address</p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Personal Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <User className="w-4 h-4 inline mr-1" />
//               Full Name *
//             </label>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.fullName ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter your full name"
//             />
//             {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               <Mail className="w-4 h-4 inline mr-1" />
//               Email Address *
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.email ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter your email"
//             />
//             {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             <Phone className="w-4 h-4 inline mr-1" />
//             Phone Number *
//           </label>
//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="h-4 w-6" />
//               <span className="ml-1 text-gray-600">+1</span>
//             </span>
//             <input
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               className={`w-full pl-16 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.phone ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="(555) 123-4567"
//               maxLength={14}
//             />
//           </div>
//           {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
//         </div>

//         {/* Address Information */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             <MapPin className="w-4 h-4 inline mr-1" />
//             Address Line 1 *
//           </label>
//           <input
//             type="text"
//             name="addressLine1"
//             value={formData.addressLine1}
//             onChange={handleChange}
//             className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//               errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
//             }`}
//             placeholder="Street address"
//           />
//           {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             <MapPin className="w-4 h-4 inline mr-1" />
//             Address Line 2
//           </label>
//           <input
//             type="text"
//             name="addressLine2"
//             value={formData.addressLine2}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent"
//             placeholder="Apartment, suite, etc. (optional)"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.city ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter city"
//             />
//             {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
//             <select
//               name="state"
//               value={formData.state}
//               onChange={handleChange}
//               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.state ? 'border-red-300' : 'border-gray-300'
//               }`}
//             >
//               <option value="">Select State</option>
//               {usStates.map(state => (
//                 <option key={state} value={state}>{state}</option>
//               ))}
//             </select>
//             {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
//             <input
//               type="text"
//               name="zipCode"
//               value={formData.zipCode}
//               onChange={handleChange}
//               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
//                 errors.zipCode ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="12345"
//               maxLength={5}
//             />
//             {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
//             <div className="relative">
//               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
//                 <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="h-4 w-6" />
//               </span>
//               <input
//                 type="text"
//                 name="country"
//                 value={formData.country}
//                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
//                 readOnly
//               />
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-4 pt-4">
//           <button
//             type="button"
//             onClick={onBack}
//             disabled={loading}
//             className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             Back to Cart
//           </button>
          
//           <button
//             type="submit"
//             disabled={loading}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               'Continue to Payment'
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ShippingForm;

// components/user_comps/ShippingForm.jsx
import React, { useState } from 'react';
import { Truck, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';

function ShippingForm({ onSubmit, onBack, loading }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format phone number as user types
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9]/g, '');
      let formatted = cleaned;
      if (cleaned.length > 3 && cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else if (cleaned.length > 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters';
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid US phone number (use format: (555) 123-4567)';
    }
    
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    else if (formData.city.length < 2) newErrors.city = 'City must be at least 2 characters';
    
    if (!formData.state.trim()) newErrors.state = 'State is required';
    
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    else if (!/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be exactly 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-[#8B5A7C]" />
          <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
        </div>
        <p className="text-gray-600">Please provide your US delivery address</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.fullName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="h-4 w-6" />
              <span className="ml-1 text-gray-600">+1</span>
            </span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-16 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
              maxLength={14}
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Address Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address Line 1 *
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
              errors.addressLine1 ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Street address"
          />
          {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address Line 2
          </label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {usStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5A7C] focus:border-transparent ${
                errors.zipCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="12345"
              maxLength={5}
            />
            {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <img src="https://flagcdn.com/w20/us.png" alt="US flag" className="h-4 w-6" />
              </span>
              <input
                type="text"
                name="country"
                value={formData.country}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back to Cart
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#8B5A7C] text-white rounded-lg hover:bg-[#8B5A7C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShippingForm;