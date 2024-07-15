export function smoothScrollToTop() {
  document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
