import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UsernameFormWrapper from "@/components/features/portfolio/page-forms/UsernameFormWrapper";
import { Page } from "@/models/Page";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ClaimUsernamePage(props) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  // The query param can arrive as a string or an array (?x=a&x=b) — keep the first value
  const rawDesiredUsername = searchParams?.desiredUsername;
  let desiredUsername = '';
  if (Array.isArray(rawDesiredUsername)) {
    desiredUsername = rawDesiredUsername[0];
  } else if (rawDesiredUsername) {
    desiredUsername = String(rawDesiredUsername);
  }

  if (!session) {
    return redirect('/');
  }

  mongoose.connect(process.env.MONGO_URI);
  const page = await Page.findOne({ owner: session?.user?.email });

  if (page) {
    return redirect('/account');
  }

  let usernameError = '';
  if (desiredUsername) {
    const existingPage = await Page.findOne({ uri: desiredUsername });
    if (existingPage) {
      usernameError = `The username "${desiredUsername}" is already taken. Please choose a different one.`;
    }
  }

  const pageProps = {
    desiredUsername: String(desiredUsername),
    usernameError: String(usernameError),
    hasError: Boolean(usernameError)
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-6 px-4 w-full min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Step 1 of 1
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Claim Your Username</h1>
          {pageProps.desiredUsername ? (
            <p className="text-gray-500 dark:text-slate-400 text-base">
              You want to claim: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">linkto/{pageProps.desiredUsername}</strong>
            </p>
          ) : (
            <p className="text-gray-500 dark:text-slate-400 text-base">
              Choose your unique username to get started
            </p>
          )}
        </div>

        {/* Error Section */}
        {pageProps.hasError && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Username Not Available</h3>
                <p className="text-sm text-red-600 mt-1">{pageProps.usernameError}</p>
                <p className="text-sm text-red-500 mt-1.5">Please try a different username below:</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Section */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <UsernameFormWrapper
            initialDesiredUsername={pageProps.hasError ? '' : pageProps.desiredUsername}
            showError={pageProps.hasError}
            key={`form-${pageProps.desiredUsername}-${pageProps.hasError}`}
          />
        </div>
      </div>
    </div>
  );
}
