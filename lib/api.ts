// API service to interact with the Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Utility function to get JWT token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwt");
  }
  return null;
};

// Leaders API
export const getLeaders = async () => {
  const response = await fetch(`${API_BASE_URL}/leaders`);
  if (!response.ok) {
    throw new Error("Failed to fetch leaders");
  }
  return response.json();
};

export const searchLeaders = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/leaders/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error("Failed to search leaders");
  }
  return response.json();
};

export const getLeader = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/leaders/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch leader");
  }
  return response.json();
};

export const createLeader = async (name: string, description: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/leaders`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, description }),
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
export const getFaults = async () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults`, {
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch faults");
  }
  return response.json();
};

export const getLeaderFaults = async (leaderId: string) => {
  const response = await fetch(`${API_BASE_URL}/leaders/${leaderId}/faults`);
  if (!response.ok) {
    throw new Error("Failed to fetch leader faults");
  }
  return response.json();
};

export const createFault = async (title: string, description: string, leaderIds: number[], imageUrl?: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/faults`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title, description, imageUrl, leaderIds }),
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
