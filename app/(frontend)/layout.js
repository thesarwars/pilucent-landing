import "@fontsource-variable/raleway";
import "./styles/app.scss";
import FooterWrapper from "../components/footer_wrapper";
import SmoothScroll from "../components/scroll";
import Provider from "../../providers/Provider";
import { Toaster } from "sonner";
import { inter, manrope, plusJakarta } from "../helpers/font";
import HeaderV2 from "../components/V2/header";

export const metadata = {
  title: "Balanzify",
  description:
    "balanzify is a software development company that specializes in building web and mobile applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SmoothScroll />
      <body className={`${inter.variable} ${manrope.variable} ${plusJakarta.variable}`}>
        <Provider>
          <Toaster richColors position="top-right" />
          <div className="font-inter relative">
            <HeaderV2 />
            {children}
            <FooterWrapper />
          </div>
        </Provider>
      </body>
    </html>
  );
}
