const searchButtonRef = document.getElementById("search-button");
const favoritesButtonRef = document.getElementById("favorites-button");

const searchTabRef = document.getElementById("search-tab");
const favoritesTabRef = document.getElementById("favorites-tab");

const searchFormRef = document.getElementById("search-form");

const searchResultsRef = document.getElementById("search-results");

const favoritesResultsRef = document.getElementById("favorites");

const searchInputRef = document.getElementById("query");

let albumStore = null;
let favoriteStore = null;

function showTabPane(paneId) {
  if (paneId === 0) {
    // Show Search Tab
    searchTabRef.classList.remove("d-none");
    favoritesTabRef.classList.add("d-none");

    searchButtonRef.classList.add("active");
    favoritesButtonRef.classList.remove("active");
  } else {
    // Show Favorites Tab
    searchTabRef.classList.add("d-none");
    favoritesTabRef.classList.remove("d-none");

    favoritesButtonRef.classList.add("active");
    searchButtonRef.classList.remove("active");
  }
}

async function getSearchResults() {
  const res = await fetch("https://661c58f6e7b95ad7fa6a303a.mockapi.io/albums");
  albumStore = await res.json();

  const searchInput = searchInputRef.value.trim().toLowerCase();

  if (searchInput.length !== 0) {
    const newFilterList = albumStore.filter(function (album) {
      return (
        album.albumName.toLowerCase().includes(searchInput) ||
        album.artistName.toLowerCase().includes(searchInput)
      );
    });
    addSearchResultsToDOM(newFilterList);
  } else addSearchResultsToDOM(albumStore);
}

async function getFavoriteAlbum() {
  const res = await fetch(
    "https://661c58f6e7b95ad7fa6a303a.mockapi.io/favorites"
  );
  favoriteStore = await res.json();
  addFavoriteToDOM(favoriteStore);
}

async function searchForm(e) {
  e.preventDefault();
  e.stopPropagation();
  getSearchResults();
}

function addSearchResultsToDOM(albumsJson) {
  searchResultsRef.innerHTML = "";
  albumsJson.forEach((album) => {
    // If it finds favorite album in store then disable "Add to favorites" button.
    // to prevent duplicate entry.

    const favoriteAlbum = favoriteStore.find((x) => x.uid === album.uid);
    let disabled = "";
    if (favoriteAlbum) disabled = "disabled";

    const newAlbum = document.createElement("li");
    newAlbum.addEventListener("click", addToFavoriteClickHandler);
    newAlbum.className =
      "list-group-item d-flex justify-content-between align-items-start";

    newAlbum.innerHTML = `
    <div class="ms-2 me-auto">
    <div class="fw-bold">
    ${album.albumName}
    <span class="badge bg-primary rounded-pill">${album.averageRating}</span>
    </div>
    <span> ${album.artistName} </span>
    </div>
    <button type="button" class="btn btn-success" ${disabled} value="${album.uid}" >Add to favorites</button>                                            
    `;

    searchResultsRef.appendChild(newAlbum);
  });
}

function addFavoriteToDOM(favoriteJson) {
  favoritesResultsRef.innerHTML = "";
  favoriteJson.forEach((album) => {
    const newAlbum = document.createElement("li");
    newAlbum.addEventListener("click", removeFromFavoriteClickHandler);
    newAlbum.className =
      "list-group-item d-flex justify-content-between align-items-start";

    newAlbum.innerHTML = `
    <div class="ms-2 me-auto">
    <div class="fw-bold">
    ${album.albumName}
    <span class="badge bg-primary rounded-pill">${album.averageRating}</span>
    </div>
    <span> ${album.artistName} </span>
    </div>
    <button type="button" class="btn btn-success" value="${album.uid}" > Remove From Album </button>                                            
    `;

    favoritesResultsRef.appendChild(newAlbum);
  });
}

async function addToFavoriteClickHandler(evt) {
  evt.preventDefault();
  const album = albumStore.find((x) => x.uid === evt.target.value);

  if (album) {
    // success the return value is the object you added
    const newFavorite = await postRequest(album);
    getFavoriteAlbum();
    getSearchResults();
  }
}

async function removeFromFavoriteClickHandler(evt) {
  evt.preventDefault();

  const album = favoriteStore.find((x) => x.uid === evt.target.value);

  if (album) {
    const status = await deleteRequest(album.id);
    getFavoriteAlbum();
    getSearchResults();
  }
}

export async function getRequest(url) {
  const res = await fetch(url);
  return await res.json();
}

export async function postRequest(album) {
  // Create a new Request Header ...... server
  // header tells what type of data is being transfered
  const requestHeader = new Headers();
  requestHeader.append("content-type", "application/json");
  requestHeader.append("cache", "no-store");

  const payload = JSON.stringify({
    albumName: album.albumName,
    artistName: album.artistName,
    releaseDate: album.releaseDate,
    descriptors: album.descriptors,
    averageRating: album.averageRating,
    numberRatings: album.numberRatings,
    numberReview: album.numberReview,
    uid: album.uid,
  });

  // request object..... add new data
  const requestObject = {
    method: "POST",
    headers: requestHeader,
    body: payload,
    redirect: "follow",
  };

  // Send the data to the mockapi service.
  const res = await fetch(
    "https://661c58f6e7b95ad7fa6a303a.mockapi.io/favorites",
    requestObject
  );

  console.log(res);
  // successful return the object that it added

  return await res.json();
}

export async function deleteRequest(id) {
  const res = await fetch(
    `https://661c58f6e7b95ad7fa6a303a.mockapi.io/favorites/${id}`,
    {
      method: "DELETE",
    }
  );
  // return the object that it removed as success   or failure
  return await res.json();
}

// Initialize app
function init() {
  // Event Listeners
  searchButtonRef.addEventListener("click", () => showTabPane(0));
  favoritesButtonRef.addEventListener("click", () => showTabPane(1));

  searchFormRef.addEventListener("submit", searchForm);
  getFavoriteAlbum();
}

init();
