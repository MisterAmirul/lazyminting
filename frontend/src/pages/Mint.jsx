//main react compnent
//renders the nft minting form and handles user interaction 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Mint() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const [color, setColor] = useState("");
  const [country, setCountry] = useState("");
  const [value, setValue] = useState(""); 
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    //Get the current authenticated user
    const getUserId = async () => {
      console.log("🔄 Getting session...");
      const { data, error } = await supabase.auth.getSession();

      console.log("📦 Session data:", data);
      console.log("❗Session error:", error);
      const sessionUser = data?.session?.user;

      if (error) {
        console.error("Error fetching user:", error);
        setUserLoading(false);
        return;
      }

      if (data?.session?.user) {
        const sessionUser = data.session.user;
        console.log("✅ User found:", sessionUser.id);
        setUserId(sessionUser.id);
      } else {
        console.warn("No session user found. Redirecting...");
        navigate("/login");
      }

      setUserLoading(false); // ✅ make sure to stop loading either way
    };
    getUserId();
  }, [navigate]);



  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    console.log("User ID being sent:", userId);

    //add user_id the form data if available
    if (userId) formData.append("user_id", userId);

    //build attribute array
    const attributes = [
      { trait_type: "Color", value: color },
      { trait_type: "Country", value: country },
      { trait_type: "Value", value: value },
    ];

    formData.append("attributes", JSON.stringify(attributes));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    const res = await fetch("http://localhost:3001/mint", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  }

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
              {/*Implement qr code generation*/}
              <div style={{ marginTop: "20px" }}>
                <p><strong>Scan QR to view NFT card:</strong></p>
                <QRCodeSVG
                  value={`http://localhost:3000/nftcard?metadataIpfs=${encodeURIComponent(response.metadataIpfs)}`}
                  size={180}
                />
                <div style={{ marginTop: "10px" }}></div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `http://localhost:3000/nftcard?metadataIpfs=${encodeURIComponent(response.metadataIpfs)}`;
                      navigator.clipboard.writeText(url);
                      alert("NFT URL copied to clipboard!");
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#007bff",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Copy NFT URL
                  </button>
              </div>
            </>
            
          ) : (
            <p>❌ Error: {response.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
