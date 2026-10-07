"use client";
import { useEffect } from "react";

const DisableScrollValueChange = ({ children }: { children: any }) => {
  useEffect(() => {
    const disableScroll = (event: any) => {
      if (event.target.type === "number") {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", disableScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", disableScroll);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e:any) => {
      if (
        e.target.type === "number" &&
        (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-" ||  e.key === "ArrowUp" ||
          e.key === "ArrowDown")
      ) {
        e.preventDefault();
      }
    };

    // const handleInput = (e:any) => {
    //   const target = e.target as HTMLInputElement;

    //   if (target.type === "number") {
    //     let value = target.value;

    //     // Allow only numbers and a single decimal point
    //     value = value.replace(/[^0-9.]/g, "");

    //     // Only allow one decimal point
    //     if ((value.match(/\./g) || []).length > 1) {
    //       value = value.slice(0, -1);
    //     }

    //     // Ensure a leading zero if the first character is a decimal
    //     if (value.startsWith(".")) {
    //       value = "0" + value;
    //     }

    //     // Remove leading zeros before decimal (except '0.')
    //     if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    //         value = value.replace(/^0+/, '0'); // Replace multiple leading zeros with a single zero
    //         if (value === '00') value = '0'; // Handle the edge case of "00" becoming "0"
    //     }


    //     // Handle backspace from "0.0", "0.0", etc.  to become "0"
    //     if (value.startsWith("0.") && value.length > 2 && e.inputType === "deleteContentBackward" && value !== "0.") {
    //         const parts = value.split('.');
    //         if(parts.length > 1 && parts[1].length > 0){
    //            if(parts[1].split("").every( digit => digit === "0")) {
    //              value = "0";
    //            }

    //         }

    //     }


    //      if (value === ".") {
    //        value = "0";
    //      }

    //     target.value = value;  // **Crucially, keep it as a string!**
    //   }
    // };

    document.addEventListener("keydown", handleKeyDown);
    // document.addEventListener("input", handleInput);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // document.removeEventListener("input", handleInput);
    };
  }, []);



  return <>{children}</>;
};

export default DisableScrollValueChange;
