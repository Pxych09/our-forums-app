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
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [expandedPosts, setExpandedPosts] = useState({})

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
  }

  function handleEditCancel() {
    setEditingPostId(null)
    setEditedCaption('')
  }

  async function handleEditSave(postId) {
    if (!editedCaption.trim()) {
      toast.error('Caption cannot be empty.')
      return
    }

    try {
      await updatePost(postId, editedCaption.trim())
      setEditingPostId(null)
      setEditedCaption('')
      toast.success('Post updated')
    } catch (error) {
      toast.error('Failed to update post.')
    }
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

    {/* Body */}
    <div className="border-t border-slate-100 pt-4">
      {editingPostId === post.id ? (
        <div className="space-y-3">
          <textarea
            value={editedCaption}
            onChange={(e) => setEditedCaption(e.target.value)}
            rows="4"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
          />

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
        <div className="px-5">
          <p className="text-slate-800 leading-7 whitespace-pre-wrap text-justify">
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
