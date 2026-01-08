import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "70px", padding: "20px" }}>{children}</main>
    </>
  );
}
