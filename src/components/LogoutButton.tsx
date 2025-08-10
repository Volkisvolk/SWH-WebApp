'use client'

export default function LogoutButton() {
  return (
    <button className="nav-link" type="button" onClick={async()=>{ await fetch('/api/logout',{ method:'POST' }); window.location.href='/' }}>Logout</button>
  )
}
