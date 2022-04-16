import Nav from "./Components/Nav";
import Hero from "./Components/Hero";
import Projects from "./Container/ProjectsContainer";
// import Footer from "./Components/Footer";

function App() {
  return (
    <div className="h-screen bg-gradient-to-b from-[#EAE8FF] to-[#EAE8FF] animate-backg-sm-animation">
      <Nav />
      <Hero />
      <Projects />
      {/* <Footer /> */}
    </div>
  );
}

export default App;
