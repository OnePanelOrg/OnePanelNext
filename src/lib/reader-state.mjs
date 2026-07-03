export function getPreviousPosition(pageIndex, panelIndex, panelCounts) {
  if (panelIndex > 0) {
    return { pageIndex, panelIndex: panelIndex - 1 };
  }
  if (pageIndex === 0) {
    return { pageIndex: 0, panelIndex: 0 };
  }
  const previousPageIndex = pageIndex - 1;
  return {
    pageIndex: previousPageIndex,
    panelIndex: panelCounts[previousPageIndex] - 1,
  };
}

export function getNextPosition(pageIndex, panelIndex, panelCounts) {
  if (panelIndex < panelCounts[pageIndex] - 1) {
    return { pageIndex, panelIndex: panelIndex + 1 };
  }
  if (pageIndex === panelCounts.length - 1) {
    return { pageIndex, panelIndex };
  }
  return { pageIndex: pageIndex + 1, panelIndex: 0 };
}
