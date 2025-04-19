export function getAncestorByClass(target, className) {
  if (target === null || target === document.body) {
    return null;
  }
  else if (target.classList?.contains(className) || target.tagName?.toLowerCase() === className) {
    return target;
  }
  else {
    return getAncestorByClass(target.parentElement, className);
  }
}
