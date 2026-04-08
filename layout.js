import "./globals.css";
import { Providers } from "./providers";
import ToastProvider from "../components/ToastProvider";

export const metadata = {
  title: "Microtasks | Earn Money Online",
  description: "Complete simple microtasks, watch videos, answer surveys, and get paid via PayPal or Gift Cards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
