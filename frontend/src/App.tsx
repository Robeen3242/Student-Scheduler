import { useState } from 'react'

{/* Imports of components */}
import './App.css'
import  Calendar from './components/Calendar'

function App() {
  {/* State initializawtion */}
  const [currentPage, setCurrentPage] = useState<"dashboard" | "calendar">("dashboard");
  return (
    <>
      <section id="center">

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
