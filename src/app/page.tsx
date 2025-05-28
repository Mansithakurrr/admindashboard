import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Keeping the default Next.js styling for context */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* Your existing Home page content... */}

        {/* ADD THIS LINK */}
        <div className="mt-8">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Go to My Dashboard &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
