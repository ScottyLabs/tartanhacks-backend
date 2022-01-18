import verification from "./verification";
import passwordReset from "./password-reset";
import recruiterSignup from "./recruiter-signup";
import statusUpdate from "./status-update";

export default {
  verification,
  "password-reset": passwordReset,
  "recruiter-signup": recruiterSignup,
  "status-update": statusUpdate,
} as Record<string, string>;
