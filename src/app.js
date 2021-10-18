// TODO: Hide Parse secrets in API proxy layer
// TODO: Add a bundler to split app.js into cacheable chunks
// TODO: Add email verification step
// TODO: Code cleanup...

const PARSE_APP_ID = "UrfoJB0mbttjtn9kbSw1JtuKkxm2c0pYmxD1BcYL";
const PARSE_JS_KEY = "V0J3x9wiwEgT6XrOAXYHBcyKVRzxzh33n4Pti0om";

Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";

/* Library for API interactions */
const AoeLib = {
  Signup: async function({ username, password, email }) {
    // Creates a new Parse "User" object, which is created by default in your Parse app
    let user = new Parse.User();
    // Set the input values to the new "User" object
    user.set("username", username);
    user.set("email", email);
    user.set("password", password);
    try {
      // Call the save method, which returns the saved object if successful
      user = await user.signUp();
      if (user !== null) {
        // Notify the success by getting the attributes from the "User" object, by using the get method (the id attribute needs to be accessed directly, though)
        console.log(
          `New user created with success! ObjectId: ${
            user.id
          }, ${user.get("username")}`
        );
        Parse.User.become(user.get("sessionToken")).then(function (user) {
          // The current user is now set to user.
        }, function (error) {
          // The token could not be validated.
          alert("Unable to save login info. Contact the website administrator.");
        });
        return user;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      throw error;
    }
  },
  Login: async function({ username, password }) {
    // Creates a new Parse "User" object, which is created by default in your Parse app
    let user = new Parse.User();
    // Set the input values to the new "User" object
    user.set("username", username);
    // user.set("email", email);
    user.set("password", password);
    try {
      // Call the save method, which returns the saved object if successful
      user = await user.logIn();
      if (user !== null) {
        // Notify the success by getting the attributes from the "User" object, by using the get method (the id attribute needs to be accessed directly, though)
        console.log(
          `Logged in with success! ObjectId: ${
            user.id
          }, ${user.get("username")}`
        );
        Parse.User.become(user.get("sessionToken")).then(function (user) {
          // The current user is now set to user.
        }, function (error) {
          // The token could not be validated.
          alert("Unable to log in. Contact the website administrator.");
        });
        return user;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      throw error;
    }
  }
};
/* End of AoE Lib */

// Initialize login button state based on whether a user is currently logged in
const loginButton = document.getElementById("login-button");
const accountDropdown = document.getElementById("account-dropdown");
const signupForm = document.querySelector("#signup");
const loginForm = document.querySelector("#login");
const loginFormSwitcher = document.getElementById("login-form-switcher");

async function initAuthState() {
  let loggedInUser = await Parse.User.currentAsync()

  if (loggedInUser) { 
    accountDropdown.classList.remove("hidden");
    document.getElementById("logged-in-user").innerText = loggedInUser.getUsername();
    
    // initialize dropdown as well
    accountDropdown.classList.remove("hidden");

    document.addEventListener("click", async function(event) {
      const isClickInside = accountDropdown.contains(event.target);
      if (isClickInside) {
        if (accountDropdown.querySelector("#account-dropdown-trigger").contains(event.target)) {
          accountDropdown.classList.add("active");
        } else if (event.target.id === "logout") {
          await Parse.User.logOut();
          accountDropdown.classList.remove("active");
          window.location.reload();
        }
      } else {
        accountDropdown.classList.remove("active");
      }
    });
  } else {
    loginButton.classList.remove("hidden");
  }
};

initAuthState();

async function submitSignupForm(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const params = {};
  for (const [key, value] of formData) {
    params[key] = value;
  }

  try {
    await AoeLib.Signup(params);
    window.location.reload();
  } catch (e) {
    // ... do nothing
  }
}

async function submitLoginForm(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const params = {};
  for (const [key, value] of formData) {
    params[key] = value;
  }

  try {
    await AoeLib.Login(params);
    window.location.reload();
  } catch (e) {
    // ... do nothing
  }
}

signupForm.addEventListener("submit", submitSignupForm);
loginForm.addEventListener("submit", submitLoginForm);

/* Cosmetics */
// Just having fun with generators. Rewrite in production!
function* nextCarouselItem(i) {
  const elCount = document.body.querySelector("#hero-banner-container > .slider-images-container").childElementCount;
  while(true) {
    yield i++ % elCount;
  }
}

window.addEventListener("DOMContentLoaded", (e) => {
  // TODO: Remove this event listener when bundler is in place
  const heroBanner = document.body.querySelector("#hero-banner-container > .slider-images-container");
  const heroBannerImages = heroBanner.querySelectorAll(".slider-image");
  const gen = nextCarouselItem(10);
  heroBanner.addEventListener("click", e => {
    let a = gen.next().value;
    heroBanner.scrollTo({
      left: heroBannerImages[a].offsetLeft,
      behaviour: "smooth"
    });
  });
});
/* End of cosmetics */

/* Basic interactions */
document.addEventListener("click", event => {
  if (event.target.className === "modal-close-button") {
    event.target.closest("dialog").close();
  }
});

loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const loginPopup = document.getElementById("login-modal");
  loginPopup.showModal();
});

loginFormSwitcher.addEventListener("click", (e) => {
  const el = e.target;
  let targetScrollOffset = 0;
  if (el.classList.contains("form-mode-switch")) {
    e.preventDefault();
    const signupForm = document.getElementById("signup");
    const loginForm = document.getElementById("login");
    if (el.closest("#login")) {
      targetScrollOffset = signupForm.offsetLeft;
      loginForm.querySelector("fieldset").setAttribute("disabled", true);
      signupForm.querySelector("fieldset").removeAttribute("disabled");
    } else 
    if (el.closest("#signup")) {
      targetScrollOffset = 0;
      signupForm.querySelector("fieldset").setAttribute("disabled", true);
      loginForm.querySelector("fieldset").removeAttribute("disabled");
    }
    loginFormSwitcher.scrollTo({
      left: targetScrollOffset,
      behavior: "smooth"
    });
  }
})
/* End of basic interactions */