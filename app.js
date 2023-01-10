//OG Attempt

const APIController = (function () {
  const clientId = "";
  const clientSecret = "";

  const basedCode = btoa(clientId + ":" + clientSecret);

  const _getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + basedCode,
      },
      body: "grant_type=client_credentials",
    });

    const data = await result.json();
    return data.access_token;
  };

  const _getArtist = async (token, artistId) => {
    const result = await fetch(`https://api.spotify.com/v1/${artistId}/1.1`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Host: "api.spotify.com",
        "Access-Control-Allow-Origin": "*",
      },
    });

    const data = await result.json();
    return data;
  };

  // const _getGenres = async (token) => {
  //   const result = await fetch(
  //     `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
  //     {
  //       method: "GET",
  //       headers: { Authorization: "Bearer " + token },
  //     }
  //   );

  //   const data = await result.json();
  //   return data.categories.items;
  // };

  return {
    getToken() {
      return _getToken();
    },
    getArtist(token, artistId) {
      return _getArtist(token, artistId);
    },
    // getGenres(token) {
    //   return _getGenres(token);
    // },
  };
})();

//UI

const UIController = (function () {
  //object to hold references to html selectors
  const DOMElements = {
    selectArtist: "#select_artist",
    buttonSubmit: "#btn_submit",
    hfToken: "#hidden_token",
    inputArtist: "#input_artist",
  };

  //public methods
  return {
    inputField() {
      return {
        submit: document.querySelector(DOMElements.buttonSubmit),
        artist: document.querySelector(DOMElements.inputArtist),
      };
    },
    storeToken(value) {
      document.querySelector(DOMElements.hfToken).value = value;
    },
    getStoredToken() {
      return {
        token: document.querySelector(DOMElements.hfToken).value,
      };
    },
    createInfo(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectArtist)
        .insertAdjacentHTML("beforeend", html);
    },
  };
})();

const APPController = (function (UICtrl, APICtrl) {
  // get input field object
  const DOMInputs = UICtrl.inputField();

  // get Token on page load
  const loadToken = async () => {
    //get token
    const token = await APICtrl.getToken();

    //store token onto the page
    UICtrl.storeToken(token);
  };

  //submit button click event listener
  DOMInputs.submit.addEventListener,
    ("click",
    async (e) => {
      e.preventDefault();
      const token = UICtrl.getStoredToken().token;
      const artist = await APICtrl.getArtist(token, e);
      artist.forEach((a) => UICtrl.createInfo(a, a));
      artist.forEach((p) => console.log(p));
    });

  //create artist event listener
  DOMInputs.artist.addEventListener("change", async (event) => {
    const token = UICtrl.getStoredToken().token;
    const artist = await APICtrl.getArtist(token, event);
    artist.forEach((p) => console.log(p));
  });

  return {
    init() {
      console.log("App is starting");
      loadToken();
    },
  };
})(UIController, APIController);

APPController.init();
