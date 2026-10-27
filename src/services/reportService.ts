import api from "./api";

export type ReportPeriod = "daily" | "weekly" | "monthly";

export const reportService = {
  downloadRegisterReport: async (period: ReportPeriod = "weekly"): Promise<void> => {
    const response = await api.get("/reports-web/register", {
      params: { period },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte-caja-${period}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
