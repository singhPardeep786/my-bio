import "../../css/main.css";
import Navbar from "../components/Navbar";
import ThreeLiquidEffect from "../components/ThreeLiquidEffect";
import LayoutContent from "./LayoutContent";

export const metadata = {
  title: "Pardeep Singh | Portfolio",
  description: "Frontend Developer Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Outfit:wght@400;500;700;900&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
