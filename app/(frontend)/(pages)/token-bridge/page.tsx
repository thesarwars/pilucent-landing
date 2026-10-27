"use client";
import { useEffect } from "react";

const TokenBridge = () => {
    
  // useEffect(() => {
  //   const handleMessage = (event) => {
  //     console.log("TokenBridge: Received message from origin:", event.origin);

  //     // Ensure the message is from the dashboard site
  //     if (event.origin !== "http://localhost:3000") {
  //       console.log(
  //         "TokenBridge: Ignored message - Invalid origin:",
  //         event.origin
  //       );
  //       return;
  //     }

  //     console.log("TokenBridge: Message data:", event.data);

  //     if (event.data.type === "GET_TOKENS") {
  //       console.log("TokenBridge: GET_TOKENS request received");

  //       try {
  //         const refresh_token = localStorage.getItem("refresh_token");
  //         const access_token = localStorage.getItem("access_token");

  //         console.log("TokenBridge: Retrieved tokens:", {
  //           hasAccessToken: !!access_token,
  //           hasRefreshToken: !!refresh_token,
  //         });

  //         if (access_token || refresh_token) {
  //           const tokensResponse = {
  //             access_token,
  //             refresh_token,
  //             success: true,
  //           };

  //           // Send tokens back to the dashboard
  //           event.source.postMessage(tokensResponse, event.origin);
  //           console.log("✅ TokenBridge: Tokens sent back to dashboard");
  //         } else {
  //           // Send error response
  //           event.source.postMessage(
  //             {
  //               error: "No tokens found in localStorage",
  //               success: false,
  //             },
  //             event.origin
  //           );
  //           console.log("❌ TokenBridge: No tokens found in localStorage");
  //         }
  //       } catch (error) {
  //         console.error("TokenBridge: Error retrieving tokens:", error);
  //         event.source.postMessage(
  //           {
  //             error: "Error retrieving tokens",
  //             success: false,
  //           },
  //           event.origin
  //         );
  //       }
  //     }
  //   };

  //   window.addEventListener("message", handleMessage);

  //   // Signal that the bridge is ready
  //   console.log("TokenBridge: Component mounted and ready to receive messages");

  //   return () => {
  //     window.removeEventListener("message", handleMessage);
  //   };
  // }, []);

  return (
    <div>
      <h1>Token Bridge</h1>
      <p>Waiting for the dashboard to request tokens...</p>
      <p>Bridge is ready to handle token requests.</p>
    </div>
  );
};

export default TokenBridge;
