import React from "react";

const AppHandle = () => {
  const [hovering, setHovering] = React.useState(false);

  const toggleHovering = () => setHovering((prev) => !prev);

  return (
    // Leetcode className flexlayout__splitter, flexlayout__splitter_vert
    <div
      className={`absolute left-0 flexlayout__splitter flexlayout__splitter_vert w-2 h-full ${
        hovering
          ? "after:h-full after:bg-[--color-splitter-drag]"
          : "after:h-[20px] after:bg-[--color-splitter]"
      }`}
      style={{ cursor: "ew-resize" }}
      onMouseEnter={toggleHovering}
      onMouseLeave={toggleHovering}
    />
  );
};

export default AppHandle;
