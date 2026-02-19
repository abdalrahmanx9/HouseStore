import React from 'react'

export default function Login() {
  const handleLogin = () => {
    // In production, use env var for API URL
    window.location.assign('http://127.0.0.1:8000/api/v1/auth/login')
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome Back</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-200"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
