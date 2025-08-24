import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";

export default defineUnlistedScript(() => {
  console.log("Inject proxy");
  setTimeout(() => {
    console.log("Push state");
    (window as any).next.router.push("/problems/add-two-numbers");
  }, 5_000);
  // const root = document.createElement("div");
  // document.body.appendChild(root);
  // createRoot(root).render(<Proxy />);
});
