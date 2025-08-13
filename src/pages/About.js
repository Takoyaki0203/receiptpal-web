// src/pages/About.jsx
import React from "react";
import teamPic from "../assets/about_picture_2.jpg";

export default function About() {
  return (
    <>
      {/* Our Story */}
      <section
        className="py-5 text-center d-flex align-items-center"
        style={{
          minHeight: 800,
          background: "linear-gradient(to bottom, #f8f9fa, #e0f7fa)",
        }}
      >
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: 900 }}>
            <h1 className="fw-bold text-center" style={{ fontSize: "3.8rem", marginTop: -70, marginBottom: 40 }}>
              Our Story
            </h1>

            <div className="text-start" style={{ marginTop: 80 }}>
              <p className="lead">
                ReceiptPal started with a simple frustration—sorting through piles of receipts felt overwhelming and
                time-consuming. I wished for a smarter way to handle both physical and digital receipts. That’s when the
                idea of ReceiptPal was born.
              </p>

              <p className="lead">
                As a solo developer, I built this app to help people like me—and also support small businesses like
                hawker stalls and convenience shops—save time by making expense tracking effortless.
              </p>

              <p className="lead">
                Powered by AWS Rekognition and Textract, ReceiptPal analyzes receipt images and extracts key data with
                over 90% accuracy. This means less manual work and more confidence in your records.
              </p>

              <p className="lead">
                My mission is to create a tool that’s accurate, secure, and easy to use, putting privacy and user trust
                first. It’s more than just automation—it’s about simplifying life with tech that works quietly and
                reliably in the background.
              </p>
            </div>

            <h5 className="mt-4">ReceiptPal helps you spend less time sorting, and more time living.</h5>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="team-section py-5 text-center">
        <div className="container">
          <h2 className="display-5 fw-bold mb-5">Meet the Team</h2>

          <div className="mx-auto" style={{ maxWidth: 520 }}>
            <img
              src={teamPic}
              alt="Founder"
              className="avatar-xl rounded-circle mb-3"
            />
            <h3 className="fw-semibold mb-1">Jarron Yeow</h3>
            <div className="text-muted mb-2">Founder &amp; Developer</div>
            <a href="mailto:takoyaki007@gmail.com" className="text-decoration-none">
              takoyaki007@gmail.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
