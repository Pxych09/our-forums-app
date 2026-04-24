export default function AboutPage() {
  return (
    <section className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">About This App</h2>
        <p className="text-sm text-slate-500 mt-1">
          This page is for sharing forums, testimonies, and life experiences where everyone can connect, learn, and inspire.
        </p>
      </div>

      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          A welcoming space for sharing forums, personal testimonies, life experiences, challenges, and insights—where everyone can express themselves, connect with others, and inspire growth through meaningful conversations.
        </p>
        <h5 className="text-black font-bold">The App Itself:</h5>
        <p>
          It is designed to be simple, fast, and responsive across devices — from mobile to desktop.
        </p>

        <p>
          Built using:
        </p>

        <ul className="list-disc pl-5 space-y-1">
          <li>React (Vite)</li>
          <li>Firebase Authentication</li>
          <li>Firestore (Realtime Database)</li>
          <li>Tailwind CSS</li>
        </ul>
                
        <div className="bg-slate-50 p-2">
        <h5 className="text-black font-bold">Sources:</h5>
        <p>
          <strong>a.</strong> Flaticon: <a href="https://www.flaticon.com/" className="text-blue-600">https://www.flaticon.com</a>
          
        </p>
        <p>
          <strong>b.</strong> Netlify: <a href="https://www.netlify.com/" title="Deploy your project here for free..." className="text-blue-600">https://www.netlify.com</a>
        </p>
        <p>
          <strong>c.</strong> Github: <a href="https://github.com/" className="text-blue-600">https://github.com</a>
        </p>
        </div>


        <h5 className="text-black font-bold">Updates:</h5>
        <p>
            This page is still under development, with more features and improvements coming soon.
        </p>
      </div>

      <div className="border-t pt-4 text-xs text-slate-400">
        <p>Version 1.0</p>
        <p>Created for learning and small private use</p>
      </div>
    </section>
  )
}
