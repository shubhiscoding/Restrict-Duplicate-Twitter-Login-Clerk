"use client";
export default function Home() {
  return (
    <div>
    Clerk Auth App
    <button onClick={() => window.location.href = '/dashboard'}>Dashboard</button>
    </div>
  );
}
