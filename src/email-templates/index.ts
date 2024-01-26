import verification from "./verification";
import passwordReset from "./password-reset";
import recruiterSignup from "./recruiter-signup";
import statusUpdate from "./status-update";
import admission from "./admission";

export default {
  verification,
  "password-reset": passwordReset,
  "recruiter-signup": recruiterSignup,
  "status-update": statusUpdate,
  admission: admission,
} as Record<string, string>;
