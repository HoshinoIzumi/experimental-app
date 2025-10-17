export const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "t_" + Math.random().toString(36).slice(2, 10);
