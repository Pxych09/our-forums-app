import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { logout } from './firebase/auth'
import { subscribeToPosts } from './firebase/posts'
import AuthForm from './components/AuthForm'
import Hero from './components/Hero'
import PostComposer from './components/PostComposer'
import PostList from './components/PostList'
import ProfilePage from './components/ProfilePage'
import { subscribeToProfiles } from './firebase/profiles'
import AboutPage from './components/AboutPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [posts, setPosts] = useState([])
  const [activePage, setActivePage] = useState('home')
  const [profiles, setProfiles] = useState([])
  const currentUserProfile = profiles.find((profile) => profile.id === user?.uid)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

useEffect(() => {
  if (!user) {
    setPosts([])
    return
  }

  const unsubscribe = subscribeToPosts(setPosts)
  return () => unsubscribe()
}, [user])

useEffect(() => {
  const unsubscribe = subscribeToProfiles(setProfiles)
  return () => unsubscribe()
}, [])

  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) return <AuthForm />

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="sticky top-4 z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur bg-white/70 border border-slate-200 rounded-3xl px-4 py-3 shadow-sm">
          <div className="flex gap-3">
            <button
              onClick={() => setActivePage('home')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activePage === 'home'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActivePage('profile')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activePage === 'profile'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              Profile
            </button>

            <button
              onClick={() => setActivePage('about')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activePage === 'about'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
            {currentUserProfile?.avatarUrl ? (
              <img
                src={currentUserProfile.avatarUrl}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-sm font-medium text-white">
                {currentUserProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-800">
                {currentUserProfile?.username || 'Unnamed User'}
              </p>
              <p className="text-xs text-slate-500 break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>


        {activePage === 'home' && (
          <>
            <Hero userEmail={user.email} onLogout={logout} />
            <PostComposer user={user} />
            <PostList posts={posts} currentUser={user} profiles={profiles} />
          </>
        )}

        {activePage === 'profile' && (
          <ProfilePage user={user} />
        )}
        {activePage === 'about' && (
          <AboutPage />
        )}
      </div>
    </main>
  )
}