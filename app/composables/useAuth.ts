interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const {
    loggedIn,
    user,
    session,
    clear,
    fetch: fetchSession,
  } = useUserSession();
  const toast = useToast();

  const isLoading = ref(false);

  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    try {
      await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
      });
      await fetchSession();
      toast.add({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
        color: "success",
      });
      await navigateTo("/dashboard");
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } };
      const message = fetchError.data?.message || "Failed to login";
      toast.add({
        title: "Login failed",
        description: message,
        color: "error",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(credentials: RegisterCredentials) {
    isLoading.value = true;
    try {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: credentials,
      });
      await fetchSession();
      toast.add({
        title: "Account created!",
        description: "Welcome to Trip Buddy.",
        color: "success",
      });
      await navigateTo("/dashboard");
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } };
      const message = fetchError.data?.message || "Failed to register";
      toast.add({
        title: "Registration failed",
        description: message,
        color: "error",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
      await clear();
      toast.add({
        title: "Logged out",
        description: "You have been logged out successfully.",
        color: "neutral",
      });
      await navigateTo("/login");
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } };
      const message = fetchError.data?.message || "Failed to logout";
      toast.add({
        title: "Logout failed",
        description: message,
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function forgotPassword(email: string) {
    isLoading.value = true;
    try {
      const response = await $fetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      toast.add({
        title: "Check your email",
        description: response.message,
        color: "success",
      });
      return response;
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } };
      const message = fetchError.data?.message || "Failed to send reset email";
      toast.add({
        title: "Error",
        description: message,
        color: "error",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(token: string, password: string) {
    isLoading.value = true;
    try {
      const response = await $fetch("/api/auth/reset-password", {
        method: "POST",
        body: { token, password },
      });
      toast.add({
        title: "Password reset",
        description: response.message,
        color: "success",
      });
      await navigateTo("/login");
      return response;
    } catch (error: unknown) {
      const fetchError = error as { data?: { message?: string } };
      const message = fetchError.data?.message || "Failed to reset password";
      toast.add({
        title: "Error",
        description: message,
        color: "error",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    session,
    loggedIn,
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    fetchSession,
  };
}
