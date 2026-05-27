import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

{/* Imports of components */}
import './App.css'
import  Calendar from './components/Calendar'

function App() {
  {/* State initializawtion */}
  const [currentPage, setCurrentPage] = useState<"dashboard" | "calendar">("dashboard");
  return (
    <>
      <section id="center">

        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>

        {/* Page state block */}
        <div>
          {currentPage === "dashboard" &&(
            <div>
              <h2>Dashboard</h2>
              <button type="button" onClick={() => setCurrentPage("calendar")}>
                Go to Calendar
              </button>
            </div>
          )}
          
          {currentPage === "calendar" && <Calendar />}
        </div>

      </section>
    </>
  )
}

export default App
