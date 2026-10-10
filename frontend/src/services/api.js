
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

async function requestJson(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      "Could not reach the analysis server. Check that the backend is running."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);

    xhr.open("POST", `${API_BASE_URL}/upload`);
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === "function") {
        const percent = Math.round(
          (event.loaded / event.total) * 100
        );
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      let data;

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(
          new Error(
            data?.detail ||
            data?.message ||
            `Upload failed with status ${xhr.status}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error("Could not connect to the backend during upload.")
      );
    };

    xhr.onabort = () => {
      reject(new Error("File upload was cancelled."));
    };

    xhr.send(formData);
  });
}

function analyzeFile(fileId, options = {}) {
  return requestJson(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...options,
      file_id: fileId,
    }),
  });
}

function getHistory() {
  return requestJson(`${API_BASE_URL}/history`);
}

function getResults(analysisId) {
  return requestJson(
    `${API_BASE_URL}/results/${encodeURIComponent(analysisId)}`
  );
}

export const api = {
  uploadFile,
  analyzeFile,
  getHistory,
  getResults,
};

export default api;
