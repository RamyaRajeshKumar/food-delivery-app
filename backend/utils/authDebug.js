// Create this file: src/utils/authDebug.js
// Use it to debug authentication issues

export const debugAuthState = () => {
  console.group('🔍 AUTH DEBUG INFO');
  
  // Check localStorage
  console.log('1. LocalStorage user:');
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('   ✅ User found in localStorage');
      console.log('   - User ID:', user._id || user.id);
      console.log('   - User Name:', user.name);
      console.log('   - User Email:', user.email);
      console.table(user);
    } else {
      console.log('   ❌ No user in localStorage');
    }
  } catch (error) {
    console.error('   ❌ Error parsing user:', error);
  }
  
  // Check token
  console.log('\n2. Auth Token:');
  const token = localStorage.getItem('token');
  if (token) {
    console.log('   ✅ Token exists');
    console.log('   - Length:', token.length);
    console.log('   - First 20 chars:', token.substring(0, 20) + '...');
  } else {
    console.log('   ❌ No token found');
  }
  
  // Check all localStorage keys
  console.log('\n3. All localStorage keys:');
  const keys = Object.keys(localStorage);
  console.log('   Keys found:', keys);
  
  console.groupEnd();
};

// Call this from browser console or add button to Profile page
export const testOrderFetch = async (userId) => {
  console.group('🧪 TEST ORDER FETCH');
  console.log('Testing with userId:', userId);
  
  try {
    const response = await fetch(`http://localhost:5000/api/orders/user-orders?userId=${userId}`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    console.log('Orders count:', data.orders?.length || 0);
    
    if (data.orders && data.orders.length > 0) {
      console.log('First order:', data.orders[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.groupEnd();
};

// Add this to your Profile.js temporarily for debugging
export const ProfileDebugButton = ({ user }) => {
  const handleDebug = () => {
    debugAuthState();
    if (user?._id) {
      testOrderFetch(user._id);
    }
  };
  
  return (
    <button 
      onClick={handleDebug}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        background: '#ff5722',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 9999
      }}
    >
      🐛 Debug Auth
    </button>
  );
};