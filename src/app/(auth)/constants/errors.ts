
/****login form error */
export const loginErrors = {
    email: {
        invalid: "Please enter a valid email address.",
        empty: "Please enter your email address.",
    },
    password: {
        invalid: "The email or password you entered is incorrect.",
        empty: "Please enter your password.",
    },
    form: {
        success: "Login successful. Redirecting to your dashboard...",
    },
};

/***register form errors */
export const registerErrors = {
  name: {
    empty: "Please enter your full name.",
  },
  email: {
    invalid: "Please enter a valid email address.",
    empty: "Please enter your email address.",
  },
  role: {
    empty: "Please select your role.",
  },
  password: {
    empty: "Please enter your password.",
    weak: "Password must be at least 6 characters long.",
      invalid: "Invalid password format.",
  },
  confirmPassword: {
    empty: "Please confirm your password.",
    mismatch: "Passwords do not match.",
    invalid: "Invalid password format.",
  },
  form: {
    success: "Registration successful. Redirecting to login...",
  },
};


/*** forgot password errors */
export const forgotErrors = {
  email: {
    invalid: "Please enter a valid email address.",
    empty: "Please enter your email address.",
    notFound: "We could not find an account with that email address.",
  },
  form: {
    success: "A verification code has been sent to your registered email address.",
  },
};


/*** verify code form errors */
export const verifyErrors = {
  code: {
    empty: "Please enter the verification code.",
    invalid: "Invalid verification code.",
  },
  form: {
    success: "Code verified successfully. Redirecting...",
  },
};

