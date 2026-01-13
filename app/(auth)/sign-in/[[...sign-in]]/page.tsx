import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        MasteryFlow
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Your Learning Operating System
                    </p>
                </div>
                <SignIn />
            </div>
        </div>
    );
}
