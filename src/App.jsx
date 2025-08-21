import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-950">
    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-300">
      Tailwind is live 🎉
    </h1>
  </div>
    </>
  )
}

export default App
