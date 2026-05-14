import "./App.css";
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Form from "@/pages/form/Form.tsx";
import Confirmation from "@/pages/form/Confirmation.tsx";
import { WelcomeImageModal } from "@/components/WelcomeImageModal.tsx";

function App() {
  const location = useLocation();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const showWelcomeModal =
    location.pathname === "/" && !welcomeDismissed;

  return (
    <>
      <WelcomeImageModal
        open={showWelcomeModal}
        onClose={() => setWelcomeDismissed(true)}
      />
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/confirmacao" element={<Confirmation />} />
      </Routes>
    </>
  );
}

export default App;
