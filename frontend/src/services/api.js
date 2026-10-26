import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 120000,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("dora_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

async function savePdf(path, payload, filename) {
  const response = await API.post(path, payload, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export const downloadReport = (project, outputs) => savePdf("/download-report", { project, ...outputs }, "Project_Dora_Report.pdf");
export const downloadSynopsis = (project, synopsis) => savePdf("/download-synopsis", { project, synopsis }, "Project_Dora_Synopsis.pdf");

export default API;
