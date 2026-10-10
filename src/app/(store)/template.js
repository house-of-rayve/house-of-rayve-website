import { ViewTransition } from "react";

// Templates re-mount on every navigation, so the page content gets an exit/enter animation
// (see the view-transition styles in globals.css). Layout parts like the header stay put.
export default function StoreTemplate({ children }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
