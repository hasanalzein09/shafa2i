// /home/ubuntu/shafa2i_project/frontend/patient-web/src/services/apiClient.js
import axios from 'axios';
import { toast } from "@/components/ui/use-toast"; // Import toast for error handling

// TODO: Replace with actual backend API URL from environment variables or config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'; // Placeholder

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to load token from storage (e.g., localStorage)
export const loadAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
};

// Function to set authorization token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
    }
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
    }
  }
};

// Add a request interceptor to include the token from storage on every request
apiClient.interceptors.request.use(config => {
    const token = loadAuthToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Add a response interceptor for handling common errors like 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized or Session Expired. Logging out.");
      setAuthToken(null); // Clear token
      // Redirect to login page - This needs to be handled in the component or context
      // Example: window.location.href = '/login';
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
    }
    // Log detailed error
    console.error(
        `API Error: ${error.config.method.toUpperCase()} ${error.config.url}`, 
        error.response ? `Status: ${error.response.status}` : '', 
        error.response ? `Data: ${JSON.stringify(error.response.data)}` : error.message
    );
    return Promise.reject(error);
  }
);

// --- Authentication Endpoints ---

export const requestOtp = async (phoneNumber) => {
  const response = await apiClient.post('/auth/otp/request', { phone_number: phoneNumber });
  return response.data;
};

export const verifyOtp = async (phoneNumber, otp) => {
  const response = await apiClient.post('/auth/otp/verify', { phone_number: phoneNumber, otp: otp });
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response.data;
};

export const logout = () => {
    setAuthToken(null);
    // Any other cleanup
    console.log("Logged out, token removed.");
};

// --- Search Endpoints ---
export const searchProviders = async (query) => {
    const response = await apiClient.get('/search/', { params: { query } });
    return response.data;
};

// --- Provider Endpoints ---
export const getProviderDetails = async (providerId) => {
    const response = await apiClient.get(`/providers/${providerId}/`);
    return response.data;
};

export const getProviderServices = async (providerId) => {
    // Assuming services are part of provider details or a separate endpoint
    // If separate: const response = await apiClient.get(`/providers/${providerId}/services/`);
    // For now, assume they are included in getProviderDetails
    const details = await getProviderDetails(providerId);
    return details.services || []; // Adjust based on actual API structure
};

// --- Appointment Endpoints ---
export const bookAppointment = async (providerId, serviceId, appointmentTime, notes) => {
    const response = await apiClient.post('/appointments/', {
        provider_id: providerId,
        service_id: serviceId,
        appointment_time: appointmentTime, // Ensure ISO format string
        notes: notes,
    });
    return response.data;
};

export const getPatientAppointments = async () => {
    const response = await apiClient.get('/appointments/');
    return response.data;
};

export const cancelAppointment = async (appointmentId) => {
    // Assuming PATCH to update status to 'Cancelled'
    const response = await apiClient.patch(`/appointments/${appointmentId}/`, { status: 'Cancelled' });
    return response.data;
};

// --- Review Endpoints ---
export const submitReview = async (providerId, rating, comment) => {
    const response = await apiClient.post('/reviews/', {
        provider_id: providerId,
        rating: rating,
        comment: comment,
    });
    return response.data;
};

// --- Prescription Endpoints ---
export const getPatientPrescriptions = async () => {
    const response = await apiClient.get('/prescriptions/');
    return response.data;
};

export const uploadPrescription = async (formData) => {
    // Use FormData for file uploads
    const response = await apiClient.post('/prescriptions/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const sendPrescriptionToPharmacy = async (prescriptionId, pharmacyId) => {
    const response = await apiClient.post(`/prescriptions/${prescriptionId}/send/`, { pharmacy_id: pharmacyId });
    return response.data;
};

// --- Pharmacy Endpoints ---
export const getPharmacies = async () => {
    // Assuming a general endpoint to list pharmacies for selection
    const response = await apiClient.get('/pharmacies/'); // Adjust endpoint if needed
    return response.data;
};

// --- Patient Profile Endpoints ---
export const getPatientProfile = async () => {
    const response = await apiClient.get('/patients/profile/');
    return response.data;
};

export const updatePatientProfile = async (profileData) => {
    const response = await apiClient.patch('/patients/profile/', profileData);
    return response.data;
};

// --- Chatbot Endpoints ---
export const sendMessageToChatbot = async (message) => {
    const response = await apiClient.post('/chatbot/', { message: message });
    return response.data; // Assuming response format { reply: "..." }
};


export default apiClient;

