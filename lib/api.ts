// API service to interact with the Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Utility function to get JWT token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwt");
  }
  return null;
};

interface PaginationData {
  pageCount: number;
  totalElements: number;
  // Add other pagination properties if they exist in the API response
}

interface LeaderContent {
  id: number;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
  numberOfFaults: number;
  voteStatus?: "LIKED" | "DISLIKED" | null;
}

interface LeadersApiResponse {
  content: LeaderContent[];
  pagination: PaginationData;
  // Add other top-level properties if they exist in the API response
}

// Leaders API
export const getLeaders = async (page: number = 0, limit: number = 5): Promise<LeadersApiResponse> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders?page=${page}&limit=${limit}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch leaders");
  }
  return response.json();
};

export const searchLeaders = async (query: string): Promise<LeaderContent[]> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders/search?query=${encodeURIComponent(query)}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to search leaders");
  }

  const leaders: LeaderContent[] = await response.json();
  return leaders;
};

export const getLeader = async (id: string) => {
   const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/leaders/${id}`,{
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch leader");
  }
  return response.json();
};

export const createLeader = async (formData: FormData) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create leader");
  }
  return response.json();
};

export const updateLeader = async (id: string, data: Partial<{ name: string; description: string; likes: number; dislikes: number }>) => {
  const response = await fetch(`${API_BASE_URL}/leaders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update leader");
  }
  return response.json();
};

export const deleteLeader = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/leaders/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete leader");
  }
  return response.json();
};

export const likeLeader = async (id: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders/${id}/like`, {
    method: "POST",
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error("You have already liked this user");
    }
    throw new Error(errorData.message || "Failed to like leader");
  }
  
  return response.json();
};

export const dislikeLeader = async (id: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders/${id}/dislike`, {
    method: "POST",
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error("You have already disliked this user");
    }
    throw new Error(errorData.message || "Failed to dislike leader");
  }
  
  return response.json();
};

// Faults API
export const getFaults = async (page: number = 0, limit: number = 5) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults?page=${page}&limit=${limit}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch faults" }));
    throw new Error(errorData.message || "Failed to fetch faults");
  }
  return response.json();
};

export const getFault = async (id: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults/${id}`, {
    headers,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch fault" }));
    throw new Error(errorData.message || "Failed to fetch fault");
  }
  return response.json();
};

export const getLeaderFaults = async (leaderId: string, page: number = 0, limit: number = 5) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders/${leaderId}/faults?page=${page}&limit=${limit}`, {
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch leader faults");
  }
  return response.json();
};

export const createFault = async (formData: FormData) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create fault");
  }
  return response.json();
};

export const updateFault = async (id: string, data: Partial<{ title: string; description: string; imageUrl: string }>) => {
  const response = await fetch(`${API_BASE_URL}/faults/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update fault");
  }
  return response.json();
};

export const deleteFault = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/faults/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete fault");
  }
  return response.json();
};

export const likeFault = async (id: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults/${id}/like`, {
    method: "POST",
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error("You have already voted on this fault");
    }
    throw new Error(errorData.message || "Failed to like fault");
  }
  
  return response.json();
};

export const dislikeFault = async (id: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults/${id}/dislike`, {
    method: "POST",
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 409) {
      throw new Error("You have already voted on this fault");
    }
    throw new Error(errorData.message || "Failed to dislike fault");
  }
  
  return response.json();
};

// Users API
export const registerUser = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to register user");
  }
  return response.json();
};

export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Failed to login user");
  }
  return response.json();
};

export const getUser = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
};
