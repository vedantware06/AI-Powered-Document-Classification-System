import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  "https://ai-document-classification-backend-docker.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Face Verification
  const [faceFile, setFaceFile] = useState(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceResult, setFaceResult] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  // =========================
  // LOAD HISTORY
  // =========================

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/history`,
        {
          timeout: 30000,
        }
      );

      setHistory(response.data);
    } catch (error) {
      console.error("History loading error:", error);
    }
  };

  // =========================
  // FILE SELECT
  // =========================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFile(selectedFile || null);
    setResult(null);
  };

  // =========================
  // UPLOAD DOCUMENT
  // =========================

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a document first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

      setResult(response.data);

      await loadHistory();
    } catch (error) {
      console.error("Upload error:", error);

      if (error.response) {
        alert(
          "Backend Error\n\n" +
            "Status: " +
            error.response.status +
            "\n\n" +
            JSON.stringify(error.response.data)
        );
      } else if (error.request) {
        alert(
          "Backend is not responding.\n\nPlease check your backend."
        );
      } else {
        alert("Error:\n\n" + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FACE VERIFICATION
  // =========================

  const handleFaceFileChange = (e) => {
    const selectedFile = e.target.files[0];

    setFaceFile(selectedFile || null);
    setFaceResult(null);
  };

  const verifyFace = async () => {
    if (!faceFile) {
      alert("Please select a face image first!");
      return;
    }

    setFaceLoading(true);
    setFaceResult(null);

    const formData = new FormData();

    formData.append("file", faceFile);

    try {
      /*
        IMPORTANT:

        हा endpoint backend मध्ये अजून create केलेला
        नसेल तर 404 येईल.

        Backend endpoint:
        POST /face-verify
      */

      const response = await axios.post(
        `${API_URL}/face-verify`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

      setFaceResult(response.data);
    } catch (error) {
      console.error("Face verification error:", error);

      if (error.response?.status === 404) {
        setFaceResult({
          status: "Not Connected",
          message:
            "Face Verification backend endpoint is not available yet.",
        });
      } else {
        setFaceResult({
          status: "Error",
          message:
            "Face Verification service is currently unavailable.",
        });
      }
    } finally {
      setFaceLoading(false);
    }
  };

  // =========================
  // DOWNLOAD REPORT
  // =========================

  const downloadReport = () => {
    if (!result) {
      alert("Please upload a document first!");
      return;
    }

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      alert(
        "Please allow pop-ups in your browser."
      );
      return;
    }

    reportWindow.document.write(`
      <html>
      <head>
        <title>AI Classification Report</title>

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
            line-height: 1.6;
          }

          h1 {
            text-align: center;
            color: #2563eb;
          }

          h2 {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
          }

          .details {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
          }

          .row {
            display: flex;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }

          .label {
            width: 180px;
            font-weight: bold;
          }

          .value {
            flex: 1;
          }

          .box {
            background: #f3f4f6;
            padding: 18px;
            border-radius: 8px;
            white-space: pre-wrap;
          }

          .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }

        </style>
      </head>

      <body>

        <h1>
          📄 AI Powered Document Classification Report
        </h1>

        <p style="text-align:center;">
          Automated Document Analysis Report
        </p>

        <h2>📊 Classification Details</h2>

        <div class="details">

          <div class="row">
            <div class="label">Filename</div>
            <div class="value">
              ${result.filename || "N/A"}
            </div>
          </div>

          <div class="row">
            <div class="label">Category</div>
            <div class="value">
              ${result.category || "N/A"}
            </div>
          </div>

          <div class="row">
            <div class="label">Confidence</div>
            <div class="value">
              ${result.confidence || "N/A"}
            </div>
          </div>

          <div class="row">
            <div class="label">Verification</div>
            <div class="value">
              ${result.verification || "N/A"}
            </div>
          </div>

          <div class="row">
            <div class="label">Fraud Detection</div>
            <div class="value">
              ${result.fraud_status || "N/A"}
            </div>
          </div>

        </div>

        <h2>📝 AI Auto Summary</h2>

        <div class="box">
          ${result.summary || "No summary available."}
        </div>

        <h2>📜 Extracted OCR Text</h2>

        <div class="box">
          ${result.text || "No text extracted."}
        </div>

        <div class="footer">

          Generated by AI Powered Document Classification System

          <br />

          AI-Based OCR • Classification • Verification • Fraud Detection

        </div>

      </body>
      </html>
    `);

    reportWindow.document.close();

    setTimeout(() => {
      reportWindow.print();
    }, 500);
  };

  // =========================
  // DASHBOARD DATA
  // =========================

  const totalDocuments = history.length;

  const categories = [
    ...new Set(
      history.map(
        (item) => item.category
      )
    ),
  ].length;

  const avgConfidence =
    history.length > 0
      ? (
          history.reduce(
            (sum, item) =>
              sum +
              parseInt(
                item.confidence || 0
              ),
            0
          ) / history.length
        ).toFixed(1)
      : 0;

  // =========================
  // CATEGORY LIST
  // =========================

  const categoryList = [
    "All",
    ...new Set(
      history.map(
        (item) => item.category
      )
    ),
  ];

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredHistory =
    history.filter((item) => {
      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        item.filename
          ?.toLowerCase()
          .includes(search) ||
        item.category
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // =========================
  // MAIN UI
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "25px",
      }}
    >

      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
          }}
        >
          📄 AI Powered Document Classification System
        </h1>

        <p
          style={{
            color: "#94a3b8",
          }}
        >
          Upload your document and classify it using AI
        </p>

      </div>


      {/* =========================
          UPLOAD CARD
      ========================= */}

      <div
        style={{
          maxWidth: "850px",
          margin: "auto",
          background: "#1e293b",
          padding: "25px",
          borderRadius: "14px",
          textAlign: "center",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.25)",
        }}
      >

        <h2
          style={{
            color: "#38bdf8",
            marginTop: 0,
          }}
        >
          📤 Upload Document
        </h2>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          style={{
            margin: "15px",
          }}
        />

        {file && (
          <p
            style={{
              color: "#22c55e",
              fontWeight: "bold",
            }}
          >
            Selected File: {file.name}
          </p>
        )}

        <button
          onClick={uploadFile}
          disabled={loading}
          style={{
            padding: "12px 30px",
            border: "none",
            borderRadius: "8px",
            background:
              loading
                ? "#64748b"
                : "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "⏳ Processing..."
            : "🚀 Upload Document"}
        </button>

      </div>


      {/* =========================
          DASHBOARD CARDS
      ========================= */}

      <div
        style={{
          maxWidth: "900px",
          margin: "25px auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "15px",
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


      {/* =========================
          CLASSIFICATION RESULT
      ========================= */}

      {result && (
        <div
          style={{
            maxWidth: "850px",
            margin: "25px auto",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "14px",
          }}
        >

          <h2
            style={{
              textAlign: "center",
              color: "#38bdf8",
            }}
          >
            📊 Classification Result
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: "12px",
            }}
          >

            <InfoBox
              title="📄 Filename"
              value={result.filename}
            />

            <InfoBox
              title="📂 Category"
              value={result.category}
            />

            <InfoBox
              title="🎯 Confidence"
              value={result.confidence}
            />

            <InfoBox
              title="✅ Verification"
              value={result.verification}
            />

            <InfoBox
              title="🛡️ Fraud Detection"
              value={result.fraud_status}
            />

          </div>


          {/* AI SUMMARY */}

          <div
            style={{
              marginTop: "20px",
              background: "#0f172a",
              padding: "18px",
              borderRadius: "10px",
            }}
          >

            <h3
              style={{
                color: "#38bdf8",
              }}
            >
              📝 AI Auto Summary
            </h3>

            <p
              style={{
                lineHeight: "1.6",
                color: "#cbd5e1",
              }}
            >
              {result.summary ||
                "No summary available."}
            </p>

          </div>


          {/* OCR */}

          <div
            style={{
              marginTop: "20px",
            }}
          >

            <h3>
              📜 Extracted Text
            </h3>

            <div
              style={{
                background: "#0f172a",
                padding: "15px",
                maxHeight: "250px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                borderRadius: "8px",
                color: "#cbd5e1",
              }}
            >
              {result.text ||
                "No text extracted."}
            </div>

          </div>


          {/* REPORT */}

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >

            <button
              onClick={downloadReport}
              style={{
                padding: "12px 25px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              📥 Download Classification Report
            </button>

          </div>

        </div>
      )}


      {/* =========================
          FACE VERIFICATION
      ========================= */}

      <div
        style={{
          maxWidth: "850px",
          margin: "25px auto",
          background: "#1e293b",
          padding: "25px",
          borderRadius: "14px",
        }}
      >

        <h2
          style={{
            textAlign: "center",
            color: "#a78bfa",
          }}
        >
          👤 Face Verification
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          Upload a face image for identity verification
        </p>

        <div
          style={{
            textAlign: "center",
          }}
        >

          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFaceFileChange}
          />

          {faceFile && (
            <p
              style={{
                color: "#22c55e",
              }}
            >
              Selected: {faceFile.name}
            </p>
          )}

          <button
            onClick={verifyFace}
            disabled={faceLoading}
            style={{
              marginTop: "10px",
              padding: "11px 25px",
              background:
                faceLoading
                  ? "#64748b"
                  : "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                faceLoading
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {faceLoading
              ? "⏳ Verifying..."
              : "🔍 Verify Face"}
          </button>

        </div>


        {faceResult && (
          <div
            style={{
              marginTop: "20px",
              background: "#0f172a",
              padding: "15px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >

            <h3
              style={{
                color:
                  faceResult.status ===
                  "Verified"
                    ? "#22c55e"
                    : "#f59e0b",
              }}
            >
              {faceResult.status}
            </h3>

            <p>
              {faceResult.message ||
                faceResult.result ||
                "Face verification response received."}
            </p>

          </div>
        )}

      </div>


      {/* =========================
          HISTORY
      ========================= */}

      {history.length > 0 && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "25px auto",
            background: "#1e293b",
            padding: "25px",
            borderRadius: "14px",
            overflowX: "auto",
          }}
        >

          <h2
            style={{
              textAlign: "center",
              color: "#38bdf8",
            }}
          >
            📂 Upload History
          </h2>


          {/* SEARCH */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "15px",
            }}
          >

            <input
              type="text"
              placeholder="🔍 Search filename or category..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              style={{
                padding: "11px",
                width: "280px",
                borderRadius: "8px",
                border:
                  "1px solid #475569",
                background: "#0f172a",
                color: "white",
              }}
            />


            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              style={{
                padding: "11px",
                borderRadius: "8px",
                border:
                  "1px solid #475569",
                background: "#0f172a",
                color: "white",
              }}
            >

              {categoryList.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>


            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
              style={{
                padding: "11px 18px",
                background: "#475569",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>

          </div>


          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            Showing{" "}
            <b>
              {filteredHistory.length}
            </b>{" "}
            of{" "}
            <b>
              {history.length}
            </b>{" "}
            documents
          </p>


          {/* TABLE */}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#2563eb",
                }}
              >

                <th style={thStyle}>
                  ID
                </th>

                <th style={thStyle}>
                  Filename
                </th>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Confidence
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredHistory.length >
              0 ? (
                filteredHistory.map(
                  (item) => (
                    <tr
                      key={item.id}
                      style={{
                        textAlign: "center",
                        borderBottom:
                          "1px solid #334155",
                      }}
                    >

                      <td style={tdStyle}>
                        {item.id}
                      </td>

                      <td style={tdStyle}>
                        {item.filename}
                      </td>

                      <td style={tdStyle}>
                        {item.category}
                      </td>

                      <td style={tdStyle}>
                        {item.confidence}
                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>

                  <td
                    colSpan="4"
                    style={{
                      padding: "25px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    🔍 No matching documents found.
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}


// =========================
// CARD COMPONENT
// =========================

function Card({
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "18px",
        borderRadius: "12px",
        textAlign: "center",
        boxShadow:
          "0 5px 15px rgba(0,0,0,0.2)",
      }}
    >

      <h2
        style={{
          color: "#38bdf8",
          margin: "5px",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          margin: "5px",
        }}
      >
        {title}
      </p>

    </div>
  );
}


// =========================
// INFO BOX
// =========================

function InfoBox({
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: "15px",
        borderRadius: "8px",
      }}
    >

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          marginBottom: "6px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontWeight: "bold",
          color: "white",
        }}
      >
        {value || "N/A"}
      </div>

    </div>
  );
}


// =========================
// TABLE STYLES
// =========================

const thStyle = {
  padding: "10px",
  fontSize: "14px",
};

const tdStyle = {
  padding: "10px",
  color: "#cbd5e1",
};


// =========================
// EXPORT
// =========================

export default App;