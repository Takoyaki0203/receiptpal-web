// src/components/Layout.js
import Navbar from "./Navbar";
import Footer from "./Footer";
import background from "../assets/background_3.png";

const Layout = ({ children }) => {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
      }}
    >
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
