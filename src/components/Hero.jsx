export default function Hero({ userEmail, onLogout }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-600 via-sky-500 to-cyan-400 text-white p-6 md:p-10 shadow-xl">
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-white/80">
          Private Forums
        </p>

        <p className="mt-4 text-white/90 max-w-2xl text-sm md:text-base">
          Share your life experiences, challenges, or lessons so others in the group can learn and grow from them.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <span hidden className="rounded-full bg-white/15 px-4 py-2 text-sm break-all">
            Signed in as {userEmail}
          </span>

          <button
            onClick={onLogout}
            className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}