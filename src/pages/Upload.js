import '../styles/style.css';
import { useEffect, useState, useRef } from 'react';
import ReceiptCard from "../components/ReceiptCard";
import logo from '../assets/logo.png';
const email = localStorage.getItem('userEmail') || '';

const API_URL = "https://3qcsvv8w40.execute-api.ap-southeast-2.amazonaws.com/prod/analyze-receipt"; 

export default function Upload() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');

    if (!email) {
      alert('Please log in first.');
      window.location.href = '/login';
    } else {
      setUserEmail(email);
      setUserName(name || 'User');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setServerResult(null);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setServerResult(null);
      setErrorMsg(null);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select or drop a receipt image first.");
      return;
    }

    setIsUploading(true);
    setServerResult(null);
    setErrorMsg(null);

    try {
      // Send raw bytes (Blob) with a precise content-type to match Lambda parser
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream",
          "X-User-Email": email
        },
        body: selectedFile
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || data?.message || `Upload failed with status ${res.status}`);
      } else {
        setServerResult(data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Main card layout */}
      <main className="container mt-5">
        <div className="card">
          <h2 className="text-center mb-3">Upload Your Receipt</h2>
          <p className="text-muted text-center mb-4">Welcome, {userEmail}</p>

          <div
            id="drop-area"
            className="mb-3"
            onClick={handleBrowseClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ cursor: 'pointer' }}
          >
            <p className="mb-2">Drag & Drop a receipt image here</p>
            <p className="text-muted">or click to browse</p>
            <input
              type="file"
              ref={inputRef}
              accept="image/*"
              hidden
              onChange={handleFileSelect}
            />
          </div>

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="preview-image"
              style={{ maxWidth: '100%', marginTop: '1rem', border: '1px solid #ccc' }}
            />
          )}

          <button
            className="btn btn-primary w-100 mt-3"
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? "Uploading..." : "Upload to Cloud"}
          </button>

          {/* Result / Error */}
          {serverResult && (
            <div className="mt-4">
              <ReceiptCard data={serverResult.data ?? serverResult} />
              {/* Debug JSON (optional) */}
              {/* <pre className="p-3 bg-light border rounded mt-3">{JSON.stringify(serverResult, null, 2)}</pre> */}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-danger mt-2" role="alert">
              {errorMsg}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
