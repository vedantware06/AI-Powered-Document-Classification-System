import { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);


  // Dashboard Calculation

  const totalDocuments = history.length;

  const categories = [
    ...new Set(history.map((item) => item.category))
  ].length;


  const avgConfidence =
    history.length > 0
      ? (
          history.reduce(
            (sum, item) =>
              sum + parseInt(item.confidence),
            0
          ) / history.length
        ).toFixed(1)
      : 0;



  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };



  const uploadFile = async () => {

    if (!file) {
      alert("Please select a file first!");
      return;
    }


    setLoading(true);


    const formData = new FormData();

    formData.append("file", file);



    try {


      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );


      setResult(response.data);



      const historyResponse = await axios.get(
        "http://127.0.0.1:8000/history"
      );


      setHistory(historyResponse.data);



    } catch(error){

      console.log(error);

      alert("Backend Error");

    }


    setLoading(false);

  };





  return (

    <div
      style={{
        background:"#0f172a",
        minHeight:"100vh",
        color:"white",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        fontFamily:"Arial",
        padding:"30px"
      }}
    >



      <h1
        style={{
          fontSize:"48px",
          textAlign:"center"
        }}
      >
        📄 AI Powered Document Classification System
      </h1>



      <p>
        Upload your document and classify it using AI
      </p>



      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        style={{
          marginTop:"20px"
        }}
      />



      {
        file &&

        <p
          style={{
            color:"#22c55e",
            fontWeight:"bold"
          }}
        >
          Selected File: {file.name}
        </p>
      }





      <button

        onClick={uploadFile}

        disabled={loading}

        style={{
          marginTop:"20px",
          padding:"12px 30px",
          background:"#2563eb",
          color:"white",
          border:"none",
          borderRadius:"8px",
          fontSize:"16px"
        }}

      >

        {
          loading 
          ? "Uploading..."
          : "Upload Document"
        }

      </button>





      {/* DASHBOARD */}


      <div

        style={{
          display:"flex",
          gap:"20px",
          marginTop:"40px",
          flexWrap:"wrap",
          justifyContent:"center"
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





      {/* RESULT */}


      {
        result &&

        <div
          style={{
            marginTop:"40px",
            width:"80%",
            background:"#1e293b",
            padding:"25px",
            borderRadius:"10px"
          }}
        >

          <h2 style={{color:"#38bdf8"}}>
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
              background:"#0f172a",
              padding:"15px",
              maxHeight:"300px",
              overflowY:"auto"
            }}
          >

            {result.text}

          </div>


        </div>

      }





      {/* HISTORY */}



      {
        history.length > 0 &&


        <div
          style={{
            marginTop:"40px",
            width:"80%",
            background:"#1e293b",
            padding:"25px",
            borderRadius:"10px"
          }}
        >


        <h2
          style={{
            color:"#38bdf8",
            textAlign:"center"
          }}
        >
          📂 Upload History
        </h2>



        <table
          style={{
            width:"100%",
            borderCollapse:"collapse"
          }}
        >


        <thead>

        <tr style={{background:"#2563eb"}}>

        <th>ID</th>
        <th>Filename</th>
        <th>Category</th>
        <th>Confidence</th>

        </tr>

        </thead>



        <tbody>


        {
          history.map((item)=>(

          <tr
          key={item.id}
          style={{
            textAlign:"center"
          }}
          >

          <td>{item.id}</td>

          <td>{item.filename}</td>

          <td>{item.category}</td>

          <td>{item.confidence}</td>


          </tr>


          ))
        }


        </tbody>


        </table>



        </div>

      }



    </div>

  );

}



// Card Component

function Card({title,value}){


return (

<div

style={{
background:"#1e293b",
padding:"25px",
width:"220px",
borderRadius:"12px",
textAlign:"center"
}}

>


<h2
style={{
color:"#38bdf8"
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