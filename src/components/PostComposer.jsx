import { useState } from 'react'
import { createPost } from '../firebase/posts'

export default function PostComposer({ user }) {
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!caption.trim()) {
      setError('Please write a caption first.')
      return
    }

    try {
      setLoading(true)
      await createPost({
        caption: caption.trim(),
        user,
      })
      setCaption('')
    } catch {
      setError('Posting failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 md:p-6 shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Create a post
          </label>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="6"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Take a moment to share something meaningful with everyone in this forum—whether it’s an idea, an experience, or a lesson that others can learn from or be inspired by."
          />
        </div>

        {error && (
          <p className="text-sm text-rose-600">{error}</p>
        )}

        <button
        type="submit"
        disabled={loading || !caption.trim()}
          className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
        >
          {loading ? 'Posting...' : 'Post now'}
        </button>
      </form>
    </section>
  )
}