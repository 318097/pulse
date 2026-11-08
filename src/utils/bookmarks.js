// chrome.bookmarks reads

// A tab can't be sent to a bookmarklet's javascript: URL, so those are left out
const isBookmark = ({ url }) => !!url && !url.startsWith("javascript:");

// Every bookmark inside `folder`, however deep, each with the folders between
// it and `folder` as `subfolder` ("Tools › CLI")
const bookmarksIn = (folder, path = []) =>
  folder.children.flatMap((node) => {
    if (node.children) return bookmarksIn(node, [...path, node.title]);
    return isBookmark(node) ? [{ ...node, subfolder: path.join(" › ") }] : [];
  });

// Bookmarks grouped one level deep, in the bookmark manager's order: each of
// Chrome's own folders (Bookmarks bar, Other bookmarks) for the bookmarks loose
// in it, then each folder in it with every bookmark inside, its subfolders
// flattened. A group is { id, title, parent, bookmarks }, `parent` being the
// Chrome folder a folder sits in; empty groups are left out.
export const getBookmarkFolders = async () => {
  const [root] = await chrome.bookmarks.getTree();
  return root.children
    .flatMap((top) => [
      {
        id: top.id,
        title: top.title,
        bookmarks: top.children.filter(isBookmark),
      },
      ...top.children
        .filter(({ children }) => children)
        .map((folder) => ({
          id: folder.id,
          title: folder.title,
          parent: top.title,
          bookmarks: bookmarksIn(folder),
        })),
    ])
    .filter(({ bookmarks }) => bookmarks.length);
};
