/** Pantalla de inicio según el rol: el admin va a su panel, el resto a "Mi espacio". */
export const homePathFor = (user) => {
  if (!user) return "/";
  return user.role === "admin" ? "/admin/dashboard" : "/user/home";
};
