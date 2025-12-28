export default defineUnlistedScript(() => {
  const getLanguages = window.monaco?.languages?.getLanguages;
  if (getLanguages == undefined) {
    return [];
  }
  return getLanguages();
});
