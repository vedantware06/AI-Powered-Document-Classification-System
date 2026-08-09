import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://ai-powered-document-classification-system.onrender.com";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW FEATURE
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");


  // ==========================
  // LOAD HISTORY ON START
  // ==========================

  useEffect(() => {

    loadHistory();

  }, []);


  // ==========================
  // LOAD HISTORY FUNCTION
  // ==========================

  const loadHistory = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/history`,
        {
          timeout: 30000
        }
      );

      setHistory(response.data);

    } catch (error) {

      console.error(
        "History loading error:",
        error
      );

    }

  };


  // ==========================
  // DOWNLOAD CLASSIFICATION REPORT
  // ==========================

  const downloadReport = () => {

    if (!result) {

      alert(
        "Please upload a document first!"
      );

      return;

    }


    const reportWindow =
      window.open(
        "",
        "_blank"
      );


    if (!reportWindow) {

      alert(
        "Please allow pop-ups in your browser to download the report."
      );

      return;

    }


    reportWindow.document.write(`

      <html>

        <head>

          <title>
            AI Classification Report
          </title>

          <style>

            body {

              font-family:
                Arial,
                sans-serif;

              padding: 40px;

              color: #111827;

              line-height: 1.6;

            }


            h1 {

              text-align: center;

              color: #2563eb;

              margin-bottom: 10px;

            }


            .subtitle {

              text-align: center;

              color: #64748b;

              margin-bottom: 35px;

            }


            h2 {

              color: #2563eb;

              border-bottom:
                2px solid #2563eb;

              padding-bottom: 8px;

              margin-top: 30px;

            }


            .details {

              border:
                1px solid #d1d5db;

              border-radius: 8px;

              overflow: hidden;

            }


            .row {

              display: flex;

              padding: 12px;

              border-bottom:
                1px solid #e5e7eb;

            }


            .row:last-child {

              border-bottom: none;

            }


            .label {

              width: 180px;

              font-weight: bold;

            }


            .value {

              flex: 1;

            }


            .summary,
            .ocr {

              background: #f3f4f6;

              padding: 18px;

              border-radius: 8px;

              white-space: pre-wrap;

              word-wrap: break-word;

            }


            .footer {

              margin-top: 50px;

              padding-top: 15px;

              border-top:
                1px solid #d1d5db;

              text-align: center;

              font-size: 12px;

              color: #6b7280;

            }

          </style>

        </head>


        <body>

          <h1>
            📄 AI Powered Document Classification Report
          </h1>


          <div class="subtitle">
            Automated Document Analysis Report
          </div>


          <h2>
            📊 Classification Details
          </h2>


          <div class="details">


            <div class="row">

              <div class="label">
                Filename
              </div>

              <div class="value">
                ${result.filename || "N/A"}
              </div>

            </div>


            <div class="row">

              <div class="label">
                Category
              </div>

              <div class="value">
                ${result.category || "N/A"}
              </div>

            </div>


            <div class="row">

              <div class="label">
                Confidence
              </div>

              <div class="value">
                ${result.confidence || "N/A"}
              </div>

            </div>


            <div class="row">

              <div class="label">
                Verification
              </div>

              <div class="value">
                ${result.verification || "N/A"}
              </div>

            </div>


            <div class="row">

              <div class="label">
                Fraud Detection
              </div>

              <div class="value">
                ${result.fraud_status || "N/A"}
              </div>

            </div>


          </div>


          <h2>
            📝 AI Auto Summary
          </h2>


          <div class="summary">

            ${result.summary ||
              "No summary available."}

          </div>


          <h2>
            📜 Extracted OCR Text
          </h2>


          <div class="ocr">

            ${result.text ||
              "No text extracted."}

          </div>


          <div class="footer">

            Generated by
            AI Powered Document Classification System

            <br />

            AI-Based OCR • Classification • Verification • Fraud Detection

          </div>


        </body>

      </html>

    `);


    reportWindow.document.close();


    // Open print dialog

    setTimeout(() => {

      reportWindow.print();

    }, 500);

  };


  // ==========================
  // Dashboard Calculation
  // ==========================

  const totalDocuments =
    history.length;


  const categories = [
    ...new Set(
      history.map(
        (item) => item.category
      )
    )
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


  // ==========================
  // CATEGORY LIST
  // ==========================

  const categoryList = [
    "All",
    ...new Set(
      history.map(
        (item) => item.category
      )
    )
  ];


  // ==========================
  // SEARCH + FILTER
  // ==========================

  const filteredHistory =
    history.filter((item) => {

      const matchesSearch =
        item.filename
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        item.category
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );


      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  // ==========================
  // File Selection
  // ==========================

  const handleFileChange = (e) => {

    setFile(
      e.target.files[0]
    );

    setResult(null);

  };


  // ==========================
  // Upload Document
  // ==========================

  const uploadFile = async () => {

    if (!file) {

      alert(
        "Please select a file first!"
      );

      return;

    }


    setLoading(true);


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    try {

      console.log(
        "Uploading:",
        file.name
      );


      // ==========================
      // UPLOAD
      // ==========================

      const response =
        await axios.post(
          `${API_URL}/upload`,
          formData,
          {

            headers: {

              "Content-Type":
                "multipart/form-data"

            },

            timeout: 120000

          }
        );


      console.log(
        "Upload Response:",
        response.data
      );


      // SHOW RESULT

      setResult(
        response.data
      );


      // ==========================
      // REFRESH HISTORY
      // ==========================

      await loadHistory();


    } catch (error) {

      console.error(
        "UPLOAD ERROR:",
        error
      );


      if (error.response) {

        alert(
          "Backend Error\n\n" +
          "Status: " +
          error.response.status +
          "\n\n" +
          JSON.stringify(
            error.response.data
          )
        );

      }


      else if (error.request) {

        alert(
          "Backend is not responding!\n\n" +
          "Please check your backend."
        );

      }


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


      {/* ==========================
          TITLE
      ========================== */}

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


      {/* ==========================
          FILE INPUT
      ========================== */}

      <input

        type="file"

        accept=".pdf,.jpg,.jpeg,.png"

        onChange={handleFileChange}

        style={{

          marginTop: "20px"

        }}

      />


      {/* ==========================
          SELECTED FILE
      ========================== */}

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


      {/* ==========================
          UPLOAD BUTTON
      ========================== */}

      <button

        onClick={uploadFile}

        disabled={loading}

        style={{

          marginTop: "20px",

          padding: "12px 30px",

          background:

            loading

              ? "#64748b"

              : "#2563eb",

          color: "white",

          border: "none",

          borderRadius: "8px",

          fontSize: "16px",

          cursor:

            loading

              ? "not-allowed"

              : "pointer"

        }}

      >

        {loading

          ? "Processing..."

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


      {/* =================================================
          CLASSIFICATION RESULT
      ================================================= */}

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

              color: "#38bdf8",

              textAlign: "center"

            }}

          >

            📊 Classification Result

          </h2>


          <p>

            📄 <b>Filename:</b>{" "}

            {result.filename}

          </p>


          <p>

            📂 <b>Category:</b>{" "}

            {result.category}

          </p>


          <p>

            🎯 <b>Confidence:</b>{" "}

            {result.confidence}

          </p>


          <p>

            ✅ <b>Verification:</b>{" "}

            {result.verification}

          </p>


          <p>

            🛡️ <b>Fraud Detection:</b>{" "}

            {result.fraud_status}

          </p>


          {/* ==========================
              AI SUMMARY
          ========================== */}

          <div

            style={{

              marginTop: "25px",

              background: "#0f172a",

              padding: "20px",

              borderRadius: "10px"

            }}

          >

            <h3

              style={{

                color: "#38bdf8"

              }}

            >

              📝 AI Auto Summary

            </h3>


            <p

              style={{

                lineHeight: "1.6"

              }}

            >

              {result.summary ||

                "No summary available."}

            </p>

          </div>


          {/* ==========================
              OCR TEXT
          ========================== */}

          <h3

            style={{

              marginTop: "25px"

            }}

          >

            📜 Extracted Text

          </h3>


          <div

            style={{

              background: "#0f172a",

              padding: "15px",

              maxHeight: "300px",

              overflowY: "auto",

              whiteSpace: "pre-wrap",

              borderRadius: "8px"

            }}

          >

            {result.text ||

              "No text extracted."}

          </div>


          {/* =================================================
              DOWNLOAD REPORT BUTTON
          ================================================= */}

          <div

            style={{

              display: "flex",

              justifyContent: "center",

              marginTop: "25px"

            }}

          >

            <button

              onClick={downloadReport}

              style={{

                padding: "13px 28px",

                background: "#16a34a",

                color: "white",

                border: "none",

                borderRadius: "8px",

                fontSize: "16px",

                fontWeight: "bold",

                cursor: "pointer",

                boxShadow:
                  "0 4px 10px rgba(0,0,0,0.3)"

              }}

            >

              📥 Download Classification Report

            </button>

          </div>


        </div>

      )}


      {/* =================================================
          HISTORY
      ================================================= */}

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


          {/* =================================================
              NEW: SEARCH + FILTER
          ================================================= */}

          <div

            style={{

              display: "flex",

              gap: "15px",

              marginBottom: "20px",

              flexWrap: "wrap",

              justifyContent: "center"

            }}

          >

            {/* SEARCH */}

            <input

              type="text"

              placeholder="🔍 Search filename or category..."

              value={searchTerm}

              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }

              style={{

                padding: "12px",

                width: "300px",

                borderRadius: "8px",

                border:
                  "1px solid #475569",

                background: "#0f172a",

                color: "white",

                fontSize: "15px"

              }}

            />


            {/* CATEGORY FILTER */}

            <select

              value={categoryFilter}

              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }

              style={{

                padding: "12px",

                borderRadius: "8px",

                border:
                  "1px solid #475569",

                background: "#0f172a",

                color: "white",

                fontSize: "15px"

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


            {/* CLEAR BUTTON */}

            <button

              onClick={() => {

                setSearchTerm("");

                setCategoryFilter("All");

              }}

              style={{

                padding: "12px 20px",

                background: "#475569",

                color: "white",

                border: "none",

                borderRadius: "8px",

                cursor: "pointer"

              }}

            >

              Clear

            </button>

          </div>


          {/* SEARCH RESULT COUNT */}

          <p

            style={{

              textAlign: "center",

              color: "#94a3b8"

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


          {/* ==========================
              HISTORY TABLE
          ========================== */}

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

                <th

                  style={{

                    padding: "10px"

                  }}

                >

                  ID

                </th>


                <th

                  style={{

                    padding: "10px"

                  }}

                >

                  Filename

                </th>


                <th

                  style={{

                    padding: "10px"

                  }}

                >

                  Category

                </th>


                <th

                  style={{

                    padding: "10px"

                  }}

                >

                  Confidence

                </th>

              </tr>

            </thead>


            <tbody>

              {filteredHistory.length > 0 ? (

                filteredHistory.map(
                  (item) => (

                    <tr

                      key={item.id}

                      style={{

                        textAlign: "center",

                        borderBottom:
                          "1px solid #334155"

                      }}

                    >

                      <td

                        style={{

                          padding: "10px"

                        }}

                      >

                        {item.id}

                      </td>


                      <td

                        style={{

                          padding: "10px"

                        }}

                      >

                        {item.filename}

                      </td>


                      <td

                        style={{

                          padding: "10px"

                        }}

                      >

                        {item.category}

                      </td>


                      <td

                        style={{

                          padding: "10px"

                        }}

                      >

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

                      color: "#94a3b8"

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


// =========================================================
// CARD COMPONENT
// =========================================================

function Card({
  title,
  value
}) {

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