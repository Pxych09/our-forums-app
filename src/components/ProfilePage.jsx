import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../firebase/profiles'

const avatarOptions = [
  'https://cdn-icons-png.flaticon.com/512/1752/1752867.png',
  'https://cdn-icons-png.flaticon.com/512/1752/1752753.png',
  'https://cdn-icons-png.flaticon.com/512/1752/1752681.png',
  'https://cdn-icons-png.flaticon.com/512/1752/1752885.png',
  'https://cdn-icons-png.flaticon.com/512/1752/1752678.png',
  'https://cdn-icons-png.flaticon.com/512/1752/1752702.png',
  'https://cdn-icons-png.flaticon.com/512/189/189001.png',
  'https://cdn-icons-png.flaticon.com/512/188/188995.png',
  'https://cdn-icons-png.flaticon.com/512/189/189000.png',
  'https://cdn-icons-png.flaticon.com/512/189/189003.png',
  'https://cdn-icons-png.flaticon.com/512/188/188991.png',
  'https://cdn-icons-png.flaticon.com/512/188/188999.png',
  'https://cdn-icons-png.flaticon.com/512/2534/2534513.png',
  'https://cdn-icons-png.flaticon.com/512/5169/5169366.png',
  'https://cdn-icons-png.flaticon.com/512/15564/15564378.png',
  'https://cdn-icons-png.flaticon.com/512/8493/8493675.png',
  'https://cdn-icons-png.flaticon.com/512/6530/6530869.png',
  'https://cdn-icons-png.flaticon.com/512/16115/16115848.png',
  'https://cdn-icons-png.flaticon.com/512/18641/18641409.png',
  'https://cdn-icons-png.flaticon.com/512/892/892736.png',
  'https://cdn-icons-png.flaticon.com/512/892/892778.png',
  'https://cdn-icons-png.flaticon.com/512/809/809154.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583465.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583478.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583479.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583481.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583482.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583483.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583470.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583471.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583472.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583473.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583474.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583475.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583476.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583477.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583469.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583468.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583467.png',
  'https://cdn-icons-png.flaticon.com/512/6583/6583466.png',
]

export default function ProfilePage({ user }) {
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(avatarOptions[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile(user.uid)

        if (profile) {
          setUsername(profile.username || '')
          setAvatarUrl(profile.avatarUrl || avatarOptions[0])
        }
      } catch (error) {
        setMessage('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user.uid])

  async function handleSave(e) {
    e.preventDefault()
    setMessage('')

    if (!username.trim()) {
      setMessage('Please enter a username.')
      return
    }

    try {
      setSaving(true)

      await saveProfile(user.uid, {
        username: username.trim(),
        avatarUrl,
        email: user.email,
      })

      setMessage('Profile saved successfully.')
    } catch (error) {
      setMessage('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <p className="text-slate-500 text-sm">Loading profile...</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl bg-white p-5 md:p-6 shadow-sm border border-slate-200">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="text-sm text-slate-500 mt-1">
        Set your username and choose a profile picture.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Set your username here!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Choose an avatar</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {avatarOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAvatarUrl(option)}
                className={`rounded-2xl border-2 p-1 transition ${
                  avatarUrl === option
                    ? 'border-sky-500'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img
                  src={option}
                  alt="Avatar option"
                  className="w-full aspect-square object-cover rounded-xl"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Selected avatar</p>
          <img
            src={avatarUrl}
            alt="Selected avatar"
            className="w-24 h-24 rounded-full object-cover border border-slate-200"
          />
        </div>

        {message && (
          <p className="text-sm text-slate-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}
