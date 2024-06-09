// import { useEffect, useRef } from "react";
// import { useRTC } from "@cb/hooks";
// import { waitForElement } from "../../utils";
// import { sendMessage as sendServiceMessage } from "@cb/services";

// const IndividualTab = () => {
//   const otherCodeRef = useRef<HTMLDivElement>(null);
//   const {
//     createOffer,
//     answerOffer,
//     callInput,
//     setCallInput,
//     closeCall,
//     sendMessage,
//     messageGot,
//     connected,
//   } = useRTC();
//   const editor = {
//     getValue: () => sendServiceMessage({ action: "getValue" }),
//     setValue: (code: string) =>
//       sendServiceMessage({ action: "setValue", value: code }),
//   };
//   let code = "";

//   if (otherCodeRef.current && messageGot) {
//     otherCodeRef.current.innerHTML = JSON.parse(messageGot).outerHTML;
//     code = JSON.parse(messageGot).code;
//   }
//   async function gettingLeetCodeNode() {
//     const MONACO_ROOT_ID =
//       "#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 > div.flex-1.overflow-hidden > div > div";
//     const leetCodeNode = await waitForElement(MONACO_ROOT_ID, 2000);
//     return leetCodeNode;
//   }

//   async function gettingCode() {
//     const leetCodeNode = await gettingLeetCodeNode();
//     const outerHTML = leetCodeNode.outerHTML;
//     const code = await editor?.getValue();
//     return { code: code, outerHTML: outerHTML };
//   }

//   const sendCode = async () => {
//     const message = await gettingCode();
//     sendMessage(JSON.stringify(message));
//   };

//   useEffect(() => {
//     if (connected) {
//       sendCode();
//     }
//     const observer = new MutationObserver(async (mutations) => {
//       await sendCode();
//     });
//     observer.observe(document, {
//       childList: true,
//       subtree: true,
//     });
//     return () => {
//       observer.disconnect();
//     };
//   }, [connected]);

//   const pasteCode = async (code: string) => {
//     await editor?.setValue(code);
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4 max-w-md mx-auto shadow-lg rounded-lg">
//       <div className="w-full max-w-sm">
//         <div className="mb-2 flex justify-between items-center">
//           <label
//             htmlFor="room-id"
//             className="text-sm font-medium text-gray-900 dark:text-white"
//           >
//             Room-id:
//           </label>
//         </div>
//         <div className="flex items-center">
//           <button
//             id="callButton"
//             onClick={createOffer}
//             className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-white bg-blue-700 dark:bg-blue-600 border hover:bg-blue-800 dark:hover:bg-blue-700 rounded-s-lg border-blue-700 dark:border-blue-600 hover:border-blue-700 dark:hover:border-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
//           >
//             Generate
//           </button>
//           <div className="relative w-full">
//             <input
//               id="room-id"
//               type="text"
//               aria-describedby="helper-text-explanation"
//               className="bg-gray-50 border border-e-0 border-gray-300 text-gray-500 dark:text-gray-400 text-sm border-s-0 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
//               value={callInput}
//               onChange={(e) => setCallInput(e.target.value)}
//             />
//           </div>
//           <button
//             data-tooltip-target="tooltip-url-shortener"
//             data-copy-to-clipboard-target="url-shortener"
//             className="flex-shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 bg-gray-100 border border-gray-300 rounded-e-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:hover:text-white dark:border-gray-600"
//             type="button"
//             onClick={() => navigator.clipboard.writeText(callInput)}
//           >
//             <span id="default-icon">
//               <svg
//                 className="w-4 h-4"
//                 aria-hidden="true"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="currentColor"
//                 viewBox="0 0 18 20"
//               >
//                 <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
//               </svg>
//             </span>
//             <span id="success-icon" className="hidden inline-flex items-center">
//               <svg
//                 className="w-4 h-4"
//                 aria-hidden="true"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 16 12"
//               >
//                 <path
//                   stroke="currentColor"
//                   stroke-linecap="round"
//                   stroke-linejoin="round"
//                   stroke-width="2"
//                   d="M1 5.917 5.724 10.5 15 1.5"
//                 />
//               </svg>
//             </span>
//           </button>
//           <div
//             id="tooltip-url-shortener"
//             role="tooltip"
//             className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
//           >
//             <span id="default-tooltip-message">Copy link</span>
//             <span id="success-tooltip-message" className="hidden">
//               Copied!
//             </span>
//             <div className="tooltip-arrow" data-popper-arrow></div>
//           </div>
//         </div>
//       </div>

//       <button
//         id="answerButton"
//         onClick={answerOffer}
//         className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
//       >
//         Answer
//       </button>

//       <button
//         onClick={closeCall}
//         className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
//       >
//         Hang up
//       </button>
//       <button
//         onClick={() => pasteCode(code)}
//         type="button"
//         className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
//       >
//         Paste to your editor
//       </button>

//       <div className="relative mx-auto  dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] w-3/4  border-sky-500">
//         <div className="text-gray-700 font-medium mb-2">Others code:</div>
//         <div ref={otherCodeRef} className="text-gray-900"></div>
//       </div>
//     </div>
//   );
// };

// export default IndividualTab;
