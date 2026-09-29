const joinClass = (...names) => names.filter(Boolean).join(" ");

const isLightHeader = (backgroundColor) => {
  const bg = String(backgroundColor || "").toLowerCase();
  return bg === "" || bg === "#ffffff" || bg === "#fff" || bg === "white";
};

export function markQuarterEdge(column) {
  const prevHeader = column.onHeaderCell;
  const prevCell = column.onCell;
  const hasChildren = Array.isArray(column.children) && column.children.length > 0;

  const next = {
    ...column,
    onHeaderCell: () => {
      const cell = prevHeader ? prevHeader() : {};
      return {
        ...cell,
        className: joinClass(
          cell.className,
          "quarter-divider",
          isLightHeader(cell.style?.backgroundColor) ? "quarter-divider-muted" : ""
        ),
      };
    },
  };

  if (hasChildren) {
    next.children = column.children.map((child, index) =>
      index === 0 ? markQuarterEdge(child) : child
    );
  } else {
    next.onCell = (record, rowIndex) => {
      const cell = prevCell ? prevCell(record, rowIndex) : {};
      return {
        ...cell,
        className: joinClass(cell.className, "quarter-divider"),
      };
    };
  }

  return next;
}
