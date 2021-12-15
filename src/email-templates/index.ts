import verification from "./verification";
import passwordReset from "./password-reset";
import recruiterSignup from "./recruiter-signup";

export default {
  verification,
  "password-reset": passwordReset,
  "recruiter-signup": recruiterSignup,
} as Record<string, string>;
