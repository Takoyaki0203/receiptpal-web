import { Link } from "react-router-dom";
import bg from "../assets/background_3.png";
import sampleImg from "../assets/home_sample.png";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: `url(${bg}) no-repeat center center fixed`,
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero */}
      <div className="container hero" style={{
        background: "linear-gradient(135deg, #2d7ff9, #00c2ff)",
        color: "#fff",
        padding: "80px 30px",
        textAlign: "center",
        borderRadius: 12,
        marginTop: 20
      }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700 }}>Welcome to ReceiptPal</h1>
        <p style={{ fontSize: "1.2rem", marginTop: 15 }}>
          Your all-in-one solution for digital expense tracking
        </p>
        <Link to="/upload" className="btn btn-light btn-cta" style={{ marginTop: 25, padding: "12px 30px", fontSize: "1.1rem", borderRadius: 8 }}>
          Get Started
        </Link>
      </div>

      {/* Features */}
      <div className="container features" style={{ marginTop: 60 }}>
        <div className="text-center mb-4">
          <h2>✨ Features You’ll Love</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="feature-card" style={cardStyle}>
              <i className="fas fa-upload" style={iconStyle} />
              <h5 className="mt-3">Quick Upload</h5>
              <p>Snap and upload receipts in seconds using your phone or laptop.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card" style={cardStyle}>
              <i className="fas fa-brain" style={iconStyle} />
              <h5 className="mt-3">AI-Powered Extraction</h5>
              <p>Let AWS Rekognition and Textract read and extract key data automatically.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card" style={cardStyle}>
              <i className="fas fa-chart-pie" style={iconStyle} />
              <h5 className="mt-3">Detailed Summary</h5>
              <p>Track total spending, item details, and vendor history all in one place.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample section */}
      <div className="container sample mt-5" style={sampleStyle}>
        <h3 className="text-center mb-4 fw-bold">Example Receipt Processing</h3>
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-5 col-md-6 text-center mb-4">
            <img
              src={sampleImg}
              alt="Sample Receipt"
              className="img-fluid sample-img"
              style={{ maxWidth: "90%", height: "auto", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: 8 }}
            />
          </div>
          <div className="col-lg-5 col-md-6">
            <ul className="list-group list-group-flush" style={{ listStyle: "none", paddingLeft: 0 }}>
              <li className="list-group-item" style={stepStyle}><strong>Step 1:</strong> Upload receipt</li>
              <li className="list-group-item" style={stepStyle}><strong>Step 2:</strong> Verify image type with Rekognition</li>
              <li className="list-group-item" style={stepStyle}><strong>Step 3:</strong> Extract text with Textract</li>
              <li className="list-group-item" style={stepStyle}><strong>Step 4:</strong> Store and display in summary</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

/* inline styles reused from your HTML’s CSS */
const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 30,
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  transition: "0.3s",
};
const iconStyle = { fontSize: "2.5rem", color: "#2d7ff9", marginBottom: 15 };
const sampleStyle = {
  background: "#fff",
  padding: "40px 30px",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};
const stepStyle = {
  fontSize: "1.15rem",
  padding: "0.75rem 1rem",
  backgroundColor: "#f9f9f9",
  borderLeft: "4px solid #007bff",
  marginBottom: "0.6rem",
  borderRadius: 6,
};
