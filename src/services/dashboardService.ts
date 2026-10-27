import api from "./api";

export const dashboardService = {
  getDashboardData: async () => {
    const { data } = await api.get("/dashboard");
    return data;
  },
};