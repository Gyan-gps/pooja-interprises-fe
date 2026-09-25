import { useEffect } from "react";

const SITE_NAME = "Pooja Enterprises";

/** Sets the document title for the current route, e.g. "Orders | Pooja Enterprises". */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;
  }, [title]);
}
