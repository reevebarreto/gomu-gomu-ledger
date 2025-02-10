import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <div className="h-screen grid grid-cols-6">
              <div className="sticky h-full top-0">
                <Navbar />
              </div>
              <div className="col-span-5">{children}</div>
            </div>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
