export default function UnauthorizedPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Unauthorized</h1>
        <p className="text-lg">
          You do not have permission to access this page. Please{" "}
          <a href="/login" className="text-blue-600 underline">
            login
          </a>{" "}
          with appropriate credentials.
        </p>
      </div>
    );
  }
  