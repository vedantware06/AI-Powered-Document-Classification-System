import { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================
  // Dashboard Calculation
  // ==========================

  const totalDocuments = history.length;

  const categories = [
    ...new Set(history.map((item) => item.category))
  ].length;

  const avgConfidence =
    history.length > 0
      ? (
          history.reduce(
            (sum, item) => sum + parseInt(item.confidence || 0),
            0
          ) / history.length
        ).toFixed(1)
      : 0;

  // ==========================
  // File Selection
  // ==========================

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  // ==========================
  // Upload Document
  // ==========================

  const uploadFile = async () => {

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {

      console.log("Uploading:", file.name);

      // Upload document
      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          timeout: 120000
        }
      );

      console.log("Upload Response:", response.data);

      // Show classification result
      setResult(response.data);

      // Get history
      try {

        const historyResponse = await axios.get(
          `${API_URL}/history`,
          {
            timeout: 30000
          }
        );

        console.log("History Response:", historyResponse.data);

        setHistory(historyResponse.data);

      } catch (historyError) {

        console.error("History Error:", historyError);

        if (historyError.response) {
          alert(
            "Document uploaded successfully, but History loading failed.\n\n" +
            "Backend Response: " +
            JSON.stringify(historyError.response.data)
          );
        } else {
          alert(
            "Document uploaded successfully, but History loading failed.\n\n" +
            historyError.message
          );
        }
      }

    } catch (error) {

      console.error("UPLOAD ERROR:", error);

      // Backend returned an error
      if (error.response) {

        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);

        alert(
          "Backend Error\n\n" +
          "Status: " +
          error.response.status +
          "\n\n" +
          JSON.stringify(error.response.data)
        );

      }

      // Request sent but no response
      else if (error.request) {

        console.error("No response from backend:", error.request);

        alert(
          "Backend is not responding!\n\n" +
          "Please make sure this is running:\n\n" +
          "uvicorn app:app --reload"
        );

      }

      // Other error
      else {

        alert(
          "Error:\n\n" +
          error.message
        );

      }

    } finally {

      setLoading(false);

    }
  };

  // ==========================
  // UI
  // ==========================

  return (

    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial",
        padding: "30px"
      }}
    >

      {/* TITLE */}

      <h1
        style={{
          fontSize: "48px",
          textAlign: "center"
        }}
      >
        📄 AI Powered Document Classification System
      </h1>

      <p>
        Upload your document and classify it using AI
      </p>

      {/* FILE INPUT */}

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{
          marginTop: "20px"
        }}
      />

      {/* SELECTED FILE */}

      {file && (

        <p
          style={{
            color: "#22c55e",
            fontWeight: "bold"
          }}
        >
          Selected File: {file.name}
        </p>

      )}

      {/* UPLOAD BUTTON */}

      <button
        onClick={uploadFile}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px 30px",
          background: loading ? "#64748b" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >

        {loading
          ? "Uploading..."
          : "Upload Document"
        }

      </button>

      {/* ==========================
          DASHBOARD
      ========================== */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >

        <Card
          title="📄 Total Documents"
          value={totalDocuments}
        />

        <Card
          title="📂 Categories"
          value={categories}
        />

        <Card
          title="🎯 Accuracy"
          value={`${avgConfidence}%`}
        />

        <Card
          title="🤖 AI Status"
          value="Active"
        />

      </div>

      {/* ==========================
          RESULT
      ========================== */}

      {result && (

        <div
          style={{
            marginTop: "40px",
            width: "80%",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "10px"
          }}
        >

          <h2
            style={{
              color: "#38bdf8"
            }}
          >
            Classification Result
          </h2>

          <p>
            📄 <b>Filename:</b> {result.filename}
          </p>

          <p>
            📂 <b>Category:</b> {result.category}
          </p>

          <p>
            🎯 <b>Confidence:</b> {result.confidence}
          </p>

          <h3>
            📜 Extracted Text
          </h3>

          <div
            style={{
              background: "#0f172a",
              padding: "15px",
              maxHeight: "300px",
              overflowY: "auto",
              whiteSpace: "pre-wrap"
            }}
          >

            {result.text || "No text extracted."}

          </div>

        </div>

      )}

      {/* ==========================
          HISTORY
      ========================== */}

      {history.length > 0 && (

        <div
          style={{
            marginTop: "40px",
            width: "80%",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "10px",
            overflowX: "auto"
          }}
        >

          <h2
            style={{
              color: "#38bdf8",
              textAlign: "center"
            }}
          >
            📂 Upload History
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#2563eb"
                }}
              >

                <th>ID</th>
                <th>Filename</th>
                <th>Category</th>
                <th>Confidence</th>

              </tr>

            </thead>

            <tbody>

              {history.map((item) => (

                <tr
                  key={item.id}
                  style={{
                    textAlign: "center"
                  }}
                >

                  <td>{item.id}</td>

                  <td>{item.filename}</td>

                  <td>{item.category}</td>

                  <td>{item.confidence}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );
}


// ==========================
// Card Component
// ==========================

function Card({ title, value }) {

  return (

    <div
      style={{
        background: "#1e293b",
        padding: "25px",
        width: "220px",
        borderRadius: "12px",
        textAlign: "center"
      }}
    >

      <h2
        style={{
          color: "#38bdf8"
        }}
      >
        {value}
      </h2>

      <p>
        {title}
      </p>

    </div>

  );
}

export default App;