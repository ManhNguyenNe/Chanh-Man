export const categoryRoutes = {
  laptop: '/laptop',
  phone: '/dien-thoai',
  pc: '/linh-kien-pc',
  all: '/san-pham',
}
export function categoryUrl(id) {
  return categoryRoutes[id] || categoryRoutes.all
}
export function categoryFromPath(path) {
  return Object.keys(categoryRoutes).find((id) => categoryRoutes[id] === path.replace(/\/$/, ''))
}
