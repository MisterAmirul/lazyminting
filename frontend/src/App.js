import { useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    const res = await fetch("http://localhost:3001/mint", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: "20px" }}>
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

        <div>
          <label>Attributes (JSON Array):</label>
          <input
            name="attributes"
            placeholder='[{"trait_type":"Color","value":"Blue"}]'
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
              <p><strong>Image IPFS:</strong> {response.imageUri}</p>
              <p><strong>Metadata IPFS:</strong> {response.metadataUri}</p>
              <pre>{JSON.stringify(response.blockchainResult, null, 2)}</pre>
            </>
          ) : (
            <p>❌ Error: {response.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
