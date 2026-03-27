export const load = ({ url }) => {
    const category = url.searchParams.get("category");
    return { category };
  };