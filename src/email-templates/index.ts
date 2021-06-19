import verification from "./verification";
import passwordReset from "./password-reset";

export default {
  verification,
  "password-reset": passwordReset,
} as Record<string, string>;
