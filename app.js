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
    const result = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,

      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await result.json();
    return data;
  };

  const _getGenres = async (token) => {
    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data;
  };

  return {
    getToken() {
      return _getToken();
    },
    getArtist(token, artistId) {
      return _getArtist(token, artistId);
    },
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
  DOMInputs.submit.addEventListener("click", async (e) => {
    console.log("Event Listener is working");
    e.preventDefault();
    const form = document.getElementById("artist_info");
    const userQuery = form.elements["input_artist"].value;
    const test = "2Mu5NfyYm8n5iTomuKAEHl";
    const token = UICtrl.getStoredToken().token;
    console.log(userQuery);
    const artist = await APICtrl.getArtist(token, userQuery);

    const results = document.getElementById("results");

    let allGenres = "";

    for (let i = 0; i < artist.genres.length; i++) {
      allGenres += artist.genres[i] + "<br>";
    }

    const html = `
    <div class="row col-sm-12 px-0">
    <a href="${artist.external_urls.spotify} target="SpotifyWindow"><img src="${artist.images[0].url}" alt="Picture of ${artist.name}"></a>        
</div>
<div class="row col-sm-12 px-0">
    <label for="artist" class="form-label col-sm-12">By ${artist.name}</label>
</div>
<div class="row col-sm-12 px-0">
    <label for="followers" class="form-label col-sm-12">Number of Followers: ${artist.followers.total}</label>
</div>
<div class="row col-sm-12 px-0">
    <label for="genres" class="form-label col-sm-12">Genres: <br> ${allGenres}</label>
</div>
 `;

    results.insertAdjacentHTML("beforeend", html);

    console.log(artist);
  });

  return {
    init() {
      console.log("App is starting");
      loadToken();
    },
  };
})(UIController, APIController);

APPController.init();
