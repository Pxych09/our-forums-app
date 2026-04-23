import { useState } from 'react'
import { createPost } from '../firebase/posts'

export default function PostComposer({ user }) {
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [typeOfPost, setTypeOfPost] = useState('Unchanged')
  const [customType, setCustomType] = useState('')
  const [subtopicInput, setSubtopicInput] = useState('')
  const [subtopics, setSubtopics] = useState([])

  function handleAddSubtopic() {
  const value = subtopicInput.trim()

  if (!value) return
  if (subtopics.length >= 5) {
    setError('You can add up to 5 subtopics only.')
    return
  }
  if (subtopics.includes(value)) {
    setError('That subtopic is already added.')
    return
  }

  setError('')
  setSubtopics((prev) => [...prev, value])
  setSubtopicInput('')
}

function handleRemoveSubtopic(topicToRemove) {
  setSubtopics((prev) => prev.filter((topic) => topic !== topicToRemove))
}

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!caption.trim()) {
      setError('Please write a caption first.')
      return
    }

    try {
      await createPost({
      caption: caption.trim(),
      user,
      typeOfPost,
      customType: typeOfPost === 'Other' ? customType.trim() : '',
      subtopics,
    })
      setCaption('')
      setTypeOfPost('Unchanged')
      setCustomType('')
      setSubtopics([])
      setSubtopicInput('')
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

          <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type of post</label>
            <select
              value={typeOfPost}
              onChange={(e) => setTypeOfPost(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            >
              <option value="Unchanged">Unchanged</option>
              <option value="Short Story">Short Story</option>
              <option value="Poem">Poem</option>
              <option value="Insight">Insight</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {typeOfPost === 'Other' && (
            <div>
              <label className="block text-sm font-medium mb-2">Specify type</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter custom type"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Subtopics</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={subtopicInput}
                onChange={(e) => setSubtopicInput(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Add a subtopic"
              />
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                Add
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Up to 5 subtopics
            </p>

            {subtopics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {subtopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleRemoveSubtopic(topic)}
                    className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm border border-sky-200 hover:bg-sky-100 transition"
                  >
                    {topic} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <hr /><br />
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
