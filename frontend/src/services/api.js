import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export const downloadReport = async (
  project,
  analysis,
  research
) => {
  const response = await API.post(
    "/download-report",
    {
      project,
      analysis,
      research,
    },
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data])
  );

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute(
    "download",
    "Project_Dora_Report.pdf"
  );

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export default API;