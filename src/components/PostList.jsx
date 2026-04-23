import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  addComment,
  deleteComment,
  deletePost,
  likePost,
  subscribeToComments,
  unlikePost,
  updatePost,
} from '../firebase/posts'

export default function PostList({ posts, currentUser, profiles }) {
const [editingPostId, setEditingPostId] = useState(null)
const [editedCaption, setEditedCaption] = useState('')
const [editedTypeOfPost, setEditedTypeOfPost] = useState('Unchanged')
const [editedCustomType, setEditedCustomType] = useState('')
const [editedSubtopicInput, setEditedSubtopicInput] = useState('')
const [editedSubtopics, setEditedSubtopics] = useState([])
const [commentsByPost, setCommentsByPost] = useState({})
const [commentInputs, setCommentInputs] = useState({})
const [expandedPosts, setExpandedPosts] = useState({})
const [readingSettingsByPost, setReadingSettingsByPost] = useState({})

  useEffect(() => {
    if (!posts.length) {
      setCommentsByPost({})
      return
    }

    const unsubscribers = posts.map((post) =>
      subscribeToComments(post.id, (comments) => {
        setCommentsByPost((prev) => ({
          ...prev,
          [post.id]: comments,
        }))
      })
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [posts])

  function getReadingSettings(postId) {
    return (
      readingSettingsByPost[postId] || {
        fontFamily: 'Inter',
        fontSize: '1rem',
        textAlign: 'left',
        textColor: '#1e293b',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        showSettings: false,
      }
    )
  }
  function updateReadingSettings(postId, patch) {
    setReadingSettingsByPost((prev) => ({
      ...prev,
      [postId]: {
        ...getReadingSettings(postId),
        ...patch,
      },
    }))
  }

  function getProfile(userId) {
    return profiles.find((profile) => profile.id === userId)
  }

  function formatDate(timestamp) {
    if (!timestamp?.seconds) return 'Just now'

    const date = new Date(timestamp.seconds * 1000)

    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  async function handleDelete(postId) {
    const confirmed = window.confirm('Are you sure you want to delete this post?')

    if (!confirmed) return

    try {
      await deletePost(postId)
      toast.success('Post deleted')
    } catch (error) {
      toast.error('Failed to delete post.')
    }
  }

function handleEditStart(post) {
  setEditingPostId(post.id)
  setEditedCaption(post.caption)
  setEditedTypeOfPost(post.typeOfPost || 'Unchanged')
  setEditedCustomType(post.customType || '')
  setEditedSubtopics(post.subtopics || [])
  setEditedSubtopicInput('')
}

function handleEditCancel() {
  setEditingPostId(null)
  setEditedCaption('')
  setEditedTypeOfPost('Unchanged')
  setEditedCustomType('')
  setEditedSubtopicInput('')
  setEditedSubtopics([])
}

async function handleEditSave(postId) {
  if (!editedCaption.trim()) {
    toast.error('Caption cannot be empty.')
    return
  }

  if (editedTypeOfPost === 'Other' && !editedCustomType.trim()) {
    toast.error('Please specify the custom type.')
    return
  }

  try {
    await updatePost(postId, {
      caption: editedCaption.trim(),
      typeOfPost: editedTypeOfPost,
      customType: editedTypeOfPost === 'Other' ? editedCustomType.trim() : '',
      subtopics: editedSubtopics,
    })

    setEditingPostId(null)
    setEditedCaption('')
    setEditedTypeOfPost('Unchanged')
    setEditedCustomType('')
    setEditedSubtopicInput('')
    setEditedSubtopics([])

    toast.success('Post updated')
  } catch (error) {
    toast.error('Failed to update post.')
  }
}

  function handleAddEditedSubtopic() {
  const value = editedSubtopicInput.trim()

  if (!value) return

  if (editedSubtopics.length >= 5) {
    toast.error('You can add up to 5 subtopics only.')
    return
  }

  if (editedSubtopics.includes(value)) {
    toast.error('That subtopic is already added.')
    return
  }

  setEditedSubtopics((prev) => [...prev, value])
  setEditedSubtopicInput('')
}

function handleRemoveEditedSubtopic(topicToRemove) {
  setEditedSubtopics((prev) =>
    prev.filter((topic) => topic !== topicToRemove)
  )
}

  async function handleLikeToggle(post) {
    const userId = currentUser?.uid
    if (!userId) return

    const alreadyLiked = post.likes?.includes(userId)

    try {
      if (alreadyLiked) {
        await unlikePost(post.id, userId)
      } else {
        await likePost(post.id, userId)
      }
      toast.success(alreadyLiked ? 'Unliked' : 'Liked')
    } catch (error) {
      toast.error('Failed to update like.')
    }
  }

  async function handleCommentSubmit(postId) {
    const text = commentInputs[postId]?.trim()

    if (!text) return

    try {
      await addComment(postId, text, currentUser)

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: '',
      }))
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment.')
    }
  }

  async function handleCommentDelete(postId, commentId) {
    const confirmed = window.confirm('Are you sure you want to delete this comment?')

    if (!confirmed) return

    try {
        await deleteComment(postId, commentId)
        toast.success('Comment deleted')
    } catch (error) {
        toast.error('Failed to delete comment.')
    }
    }

  if (!posts.length) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 text-center text-slate-500">
        No posts yet. Be the first to share one.
      </section>
    )
  }

  function handleToggleExpand(postId) {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  return (
    <section className="grid gap-4 sm:gap-6">
      {posts.map((post) => {
        const postProfile = getProfile(post.userId)

        return (
          <article
  key={post.id}
  className="rounded-3xl bg-white p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition"
>
  <div className="space-y-5">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center min-w-0 flex-col">
        {postProfile?.avatarUrl ? (
          <img
            src={postProfile.avatarUrl}
            alt="Profile avatar"
            className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-400 flex items-center justify-center text-sxs font-medium text-white shrink-0">
            {postProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sxs font-semibold text-sky-800 truncate">
            {postProfile?.username ? `@${postProfile.username}` : 'Unnamed User'}
          </p>
          <p hidden className="text-xs text-slate-500 break-all">
            {post.userEmail}
          </p>
        </div>
      </div>

      <div className="text-right text-sxs text-slate-400 shrink-0 space-y-1">
        <p className='text-slate-600'>Posted: {formatDate(post.createdAt)}</p>
        {post.updatedAt?.seconds && (
          <p className='text-emerald-700'>Edited: {formatDate(post.updatedAt)}</p>
        )}
      </div>
    </div>
        
    {/* Section */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type of Post
          </p>
          <p className="text-sm font-medium text-slate-800 mt-1">
            {post.typeOfPost === 'Other'
              ? `Other: ${post.customType || 'Unspecified'}`
              : `${post.typeOfPost || 'Unchanged'}`}
          </p>
        </div>

        <div className="sm:text-right border-y border-stone-400 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reading Settings
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Viewer-controlled only
          </p>

          <button
            type="button"
            onClick={() =>
              updateReadingSettings(post.id, {
                showSettings: !getReadingSettings(post.id).showSettings,
              })
            }
            className="w-full mt-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            {getReadingSettings(post.id).showSettings ? 'Hide settings' : 'Show settings'}
          </button>
        </div>
      </div>

      {getReadingSettings(post.id).showSettings && (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Font Family
            </label>
            <select
              value={getReadingSettings(post.id).fontFamily}
              onChange={(e) =>
                updateReadingSettings(post.id, { fontFamily: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Supermercado One, sans-serif">Supermercado One</option>
              <option value="'Share Tech', sans-serif">Share Tech</option>
              <option value="Playwrite NZ Guides">Playwrite NZ Guides</option>
              <option value="Playwrite IE">Playwrite IE</option>
              <option value="'Lobster Two', sans-serif">Lobster Two</option>
              <option value="'Google Sans', sans-serif">Google Sans</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Font Size
            </label>
            <input
              type="text"
              value={getReadingSettings(post.id).fontSize}
              onChange={(e) =>
                updateReadingSettings(post.id, { fontSize: e.target.value })
              }
              placeholder="1rem"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Text Align
            </label>
            <select
              value={getReadingSettings(post.id).textAlign}
              onChange={(e) =>
                updateReadingSettings(post.id, { textAlign: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Text Color
            </label>
            <input
              type="color"
              value={getReadingSettings(post.id).textColor}
              onChange={(e) =>
                updateReadingSettings(post.id, { textColor: e.target.value })
              }
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-1 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={getReadingSettings(post.id).backgroundColor}
              onChange={(e) =>
                updateReadingSettings(post.id, { backgroundColor: e.target.value })
              }
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-1 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Border Color
            </label>
            <input
              type="color"
              value={getReadingSettings(post.id).borderColor}
              onChange={(e) =>
                updateReadingSettings(post.id, { borderColor: e.target.value })
              }
              className="w-full h-10 rounded-xl border border-slate-300 bg-white px-1 py-1"
            />
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Subtopics
        </p>

        {post.subtopics?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.subtopics.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 rounded-full text-sm font-medium text-slate-800 
                        bg-linear-to-r from-stone-200 via-zinc-200 to-neutral-300 
                        border border-dashed border-stone-400 
                        hover:bg-linear-to-r hover:from-stone-300 hover:to-neutral-400 
                        transition"
            >
              {topic}
            </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No subtopics</p>
        )}
      </div>
    </div>

    {/* Body */}
    <div className="border-t border-slate-100 pt-4">
      {editingPostId === post.id ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type of post</label>
            <select
              value={editedTypeOfPost}
              onChange={(e) => setEditedTypeOfPost(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="Unchanged">Unchanged</option>
              <option value="Short Story">Short Story</option>
              <option value="Poem">Poem</option>
              <option value="Insight">Insight</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {editedTypeOfPost === 'Other' && (
            <div>
              <label className="block text-sm font-medium mb-2">Specify type</label>
              <input
                type="text"
                value={editedCustomType}
                onChange={(e) => setEditedCustomType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter custom type"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Subtopics</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={editedSubtopicInput}
                onChange={(e) => setEditedSubtopicInput(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Add a subtopic"
              />
              <button
                type="button"
                onClick={handleAddEditedSubtopic}
                className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                Add
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Up to 5 subtopics
            </p>

            {editedSubtopics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {editedSubtopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleRemoveEditedSubtopic(topic)}
                    className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm border border-sky-200 hover:bg-sky-100 transition"
                  >
                    {topic} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Caption</label>
            <textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              rows="4"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleEditSave(post.id)}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition"
            >
              Save
            </button>

            <button
              onClick={handleEditCancel}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="px-5 py-4 rounded-2xl"
          style={{
            fontFamily: getReadingSettings(post.id).fontFamily,
            fontSize: getReadingSettings(post.id).fontSize,
            textAlign: getReadingSettings(post.id).textAlign,
            color: getReadingSettings(post.id).textColor,
            backgroundColor: getReadingSettings(post.id).backgroundColor,
            border: `1px solid ${getReadingSettings(post.id).borderColor}`,
          }}
        >
          <p className="leading-7 whitespace-pre-wrap">
            {expandedPosts[post.id] || post.caption.length <= 180
              ? post.caption
              : `${post.caption.slice(0, 180)}...`}
          </p>

          {post.caption.length > 180 && (
            <button
              onClick={() => handleToggleExpand(post.id)}
              className="mt-2 text-sm font-medium text-sky-600 hover:underline"
            >
              {expandedPosts[post.id] ? 'See less' : 'See more'}
            </button>
          )}
        </div>
      )}
    </div>

    {/* Actions */}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleLikeToggle(post)}
          className={`text-sm px-4 py-2 rounded-full border transition ${
            post.likes?.includes(currentUser?.uid)
              ? 'bg-sky-500 text-white border-sky-500'
              : 'bg-white text-sky-600 border-slate-200 hover:bg-sky-50'
          }`}
        >
          {post.likes?.includes(currentUser?.uid) ? 'Unlike' : 'Like'}
        </button>

        <span className="text-sm text-slate-500">
          {post.likes?.length || 0} like
          {(post.likes?.length || 0) === 1 ? '' : 's'}
        </span>
      </div>

      {currentUser?.uid === post.userId && editingPostId !== post.id && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditStart(post)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(post.id)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>

    {/* Comments */}
    <div className="border-t border-slate-100 pt-4 space-y-4">
      <div className="space-y-2">
        <textarea
          value={commentInputs[post.id] || ''}
          onChange={(e) =>
            setCommentInputs((prev) => ({
              ...prev,
              [post.id]: e.target.value,
            }))
          }
          rows="2"
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Write a comment..."
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleCommentSubmit(post.id)}
            className="text-sm bg-sky-500 text-white px-4 py-2 rounded-full hover:bg-sky-400 transition"
          >
            Comment
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(commentsByPost[post.id] || []).map((comment) => {
          const commentProfile = getProfile(comment.userId)

          return (
            <div
              key={comment.id}
              className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center min-w-0 flex-col border border-slate-400 rounded-2xl p-2">
                  {commentProfile?.avatarUrl ? (
                    <img
                      src={commentProfile.avatarUrl}
                      alt="Comment avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center text-xs font-medium text-white shrink-0">
                      {commentProfile?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {commentProfile?.username || 'Unnamed User'}
                    </p>
                    <p hidden className="text-xs text-slate-500 break-all">
                      {comment.userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                    <p className="text-slate-800 whitespace-pre-wrap">
                        {comment.text}
                    </p>

                    <p className="text-xs text-slate-400 shrink-0">
                        {formatDate(comment.createdAt)}
                    </p>
                </div>
                
              </div>

              {currentUser?.uid === comment.userId && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handleCommentDelete(post.id, comment.id)}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  </div>
</article>
        )
      })}
    </section>
  )
}
