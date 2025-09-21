import { registerStaffMember } from "../../../../actions/auth";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">
            Create your business account
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          {/* <div>
            <label htmlFor="businessName" className="block text-sm font-medium">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div> */}
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium">
              Your Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border px-3 py-2"
            />
          </div>
          <button
            formAction={registerStaffMember}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            create admin account
          </button>
        </form>
      </div>
    </div>
  );
}
