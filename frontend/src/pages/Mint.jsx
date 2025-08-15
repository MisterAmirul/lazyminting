//main react compnent
//renders the nft minting form and handles user interaction 
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Mint() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const [color, setColor] = useState("");
  const [country, setCountry] = useState("");
  const [value, setValue] = useState(""); 

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    //build attribute array
    const attributes = [
      { trait_type: "Color", value: color },
      { trait_type: "Country", value: country },
      { trait_type: "Value", value: value },
    ];

    formData.append("attributes", JSON.stringify(attributes));

    const res = await fetch("http://localhost:3001/mint", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  }

  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ padding: "20px", position: "relative" }}>
        <div style={{ position: "absolute", top: 20, right: 20 }}>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>
      <h1>Mint NFT</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>NFT Name:</label>
          <input name="name" type="text" required />
        </div>

        <div>
          <label>Description:</label>
          <textarea name="description" required />
        </div>

        <div>
          <label>Supplies:</label>
          <input name="supplies" type="number" defaultValue="1" required />
        </div>

        {/*attribute field for color trait*/}
        <div>
          <label>Color:</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>

        {/*attribute field for manufacturing country trait*/}
        <div>
          <label>Manufacturing Country:</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>

        {/*attribute field for value trait*/}
        <div>
          <label>Value:</label>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Image:</label>
          <input type="file" name="image" accept="image/*" required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: "20px" }}>
          {response.success ? (
            <>
              <p>✅ Mint successful!</p>

              <p><strong>Image HTTP:</strong></p>
              <img
                src={response.imageHttp}
                alt="Minted NFT"
                style={{ maxWidth: "400px", border: "1px solid #ccc", borderRadius: "8px" }}
              />
              <p><strong>Metadata HTTP:</strong> <a href={response.metadataHttp} target="_blank" rel="noopener noreferrer">{response.metadataHttp}</a></p>
              <p><strong>Transaction Hash:</strong> {response.transactionHash ? (
                <a
                  href={`https://sepolia.arbiscan.io/tx/${response.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {response.transactionHash}
                </a>
              ) : "Not available"}</p>
            </>
            
          ) : (
            <p>❌ Error: {response.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
