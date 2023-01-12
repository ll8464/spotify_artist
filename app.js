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

  const _getSearch = async (token, query) => {
    const result = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=artist`,

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
    getSearch(token, query) {
      return _getSearch(token, query);
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
    form: "#artist_info",
    results: "#results",
  };

  //public methods
  return {
    inputField() {
      return {
        submit: document.querySelector(DOMElements.buttonSubmit),
        artist: document.querySelector(DOMElements.inputArtist),
        form: document.querySelector(DOMElements.form),
        results: document.querySelector(DOMElements.results),
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
    e.preventDefault();

    const userQuery = DOMInputs.form.elements["input_artist"].value;

    //Encodes user queries to ASCII for use in URI
    const encodeQuery = encodeURIComponent(userQuery);

    //console.log(encodeQuery);

    const token = UICtrl.getStoredToken().token;

    const search = await APICtrl.getSearch(token, encodeQuery);

    const artistCall = await search.artists.items[0].id;

    const artist = await APICtrl.getArtist(token, artistCall);

    let allGenres = "";

    for (let i = 0; i < artist.genres.length; i++) {
      allGenres += artist.genres[i] + "<br>";
    }

    const html = `
        <label for="results">Results:</label>
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

    DOMInputs.results.insertAdjacentHTML("beforeend", html);

    console.log(search);

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
