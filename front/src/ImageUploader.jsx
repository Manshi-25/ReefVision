
import React, { useState, useRef } from "react";
import axios from "axios";

const MODELS = [
  { value: "cnn",         label: "CNN" },
  { value: "resnet",      label: "ResNet" },
  { value: "densenet",    label: "DenseNet" },
  { value: "efficientnet",label: "EfficientNet" },
];

function classifyResult(prediction) {
  if (!prediction) return "default";
  const p = prediction.toLowerCase();
  if (p.includes("healthy")) return "healthy";
  if (p.includes("bleach") || p.includes("dead") || p.includes("unhealthy") || p.includes("disease") || p.includes("damage")) return "unhealthy";
  return "default";
}

const ImageUploader = () => {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [model, setModel]         = useState("cnn");
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [barWidth, setBarWidth]   = useState(0);
  const fileInputRef              = useRef(null);
  const abortControllerRef        = useRef(null);

  const applyFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setPrediction(null);
    setConfidence(null);
    setBarWidth(0);
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setPrediction(null);
    setConfidence(null);
    setBarWidth(0);
    setModel("cnn");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFind = async () => {
    if (!file) return;
    setIsLoading(true);
    setBarWidth(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", model);

    abortControllerRef.current = new AbortController();

    try {
      const response = await axios.post(
        "https://coral-health-detection-model.onrender.com/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: abortControllerRef.current.signal,
        }
      );
      const conf = response.data.confidence;
      setPrediction(response.data.result);
      setConfidence(conf);
      setTimeout(() => setBarWidth(conf ?? 0), 50);
    } catch (error) {
      if (axios.isCancel(error) || error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        // silently cancelled — do nothing
      } else {
        console.error("Error uploading file:", error);
        alert("An error occurred while processing the image. Please try again.");
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const kind = classifyResult(prediction);
  const badgeClass = { healthy: "badge-healthy", unhealthy: "badge-unhealthy", default: "badge-default" }[kind];
  const resultClass = { healthy: "result-healthy", unhealthy: "result-unhealthy", default: "result-default" }[kind];
  const fillClass   = { healthy: "fill-healthy",   unhealthy: "fill-unhealthy",   default: "fill-default" }[kind];

  return (
    <section className="image-upload-section">
      <div className="upload-card">
        <h2>Analyse Coral Health</h2>
        <p className="subtitle">Upload a reef image and select an AI model to get an instant health diagnosis</p>

        {/* Drop zone / preview */}
        {!file ? (
          <div
            className={`drop-zone${dragging ? " dragging" : ""}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <svg className="drop-zone-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M32 10 L32 42M22 22 L32 10 L42 22" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 44 L12 52 L52 52 L52 44" strokeLinecap="round"/>
              <circle cx="20" cy="35" r="5" strokeDasharray="2 2"/>
              <circle cx="44" cy="30" r="7" strokeDasharray="2 2"/>
            </svg>
            <p>Drag &amp; drop a reef image here, or <span className="browse-link">browse files</span></p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", opacity: 0.5 }}>PNG, JPG, JPEG supported</p>
          </div>
        ) : (
          <div className="image-preview">
            <div className="preview-wrapper">
              <img src={preview} alt="Preview" className="preview-image" />
              <button className="change-image-btn" onClick={() => { setFile(null); setPreview(null); setPrediction(null); }}>
                ✕ Change
              </button>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/*"
        />

        {/* Model selector — only shown after file selected */}
        {file && (
          <div className="model-selection-container">
            <label>Select AI Model</label>
            <div className="model-grid">
              {MODELS.map((m) => (
                <button
                  key={m.value}
                  className={`model-option${model === m.value ? " selected" : ""}`}
                  onClick={() => { setModel(m.value); setPrediction(null); }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button onClick={handleFind} disabled={isLoading} className="find-button">
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner" /> Analysing reef…
                </span>
              ) : "Analyse Now →"}
            </button>

            {isLoading && (
              <button onClick={handleCancel} className="cancel-button">
                ✕ Cancel
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {prediction && (
          <div className={`prediction-result ${resultClass}`}>
            <span className={`result-badge ${badgeClass}`}>
              {kind === "healthy" ? "✓ Healthy" : kind === "unhealthy" ? "⚠ Alert" : "ℹ Result"}
            </span>
            <div className="result-title">{prediction}</div>

            {confidence !== null && (
              <div className="confidence-bar-wrapper">
                <div className="confidence-label">Confidence</div>
                <div className="confidence-bar">
                  <div
                    className={`confidence-fill ${fillClass}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="confidence-pct">{confidence}%</div>
              </div>
            )}

            <button onClick={handleReset} className="new-image-button">
              ＋ Test a New Image
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageUploader;