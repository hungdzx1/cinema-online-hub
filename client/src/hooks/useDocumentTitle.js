import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const defaultTitle = 'Cinema Hub - Xem Phim Trực Tuyến';
    if (title) {
      document.title = `${title} | Cinema Hub`;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
};
