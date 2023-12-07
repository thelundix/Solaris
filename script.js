// Add an event listener to the document that triggers when the DOM content is fully loaded.
// This ensures that the main function is called only after the HTML is fully parsed.
document.addEventListener("DOMContentLoaded", main);

/**
 * A helper function to get a specific planet element from the DOM.
 * @param {string} id - The suffix of the element's ID to be selected.
 * @returns {Element} The DOM element corresponding to the given ID.
 */
function getPlanetElement(id) {
  // Select and return the element with an ID that matches 'planet' followed by the provided id.
  return document.querySelector(`#planet${id}`);
}

// An object that stores references to various DOM elements related to planet information.
// Each property of this object represents a different part of the UI for displaying planet data.
const elements = {
  title: getPlanetElement("Title"), // Element to display the planet's title.
  latinName: getPlanetElement("LatinName"), // Element to display the planet's Latin name.
  info: getPlanetElement("Info"), // Element to display the planet's information.
  circumference: getPlanetElement("Circumference"), // Element to display the planet's circumference.
  distance: getPlanetElement("Distance"), // Element to display the planet's distance from the sun.
  tempDay: getPlanetElement("TempDay"), // Element to display the planet's daytime temperature.
  tempNight: getPlanetElement("TempNight"), // Element to display the planet's nighttime temperature.
  moons: getPlanetElement("Moons"), // Element to display the planet's moons.
  modalPopup: document.querySelector("#modularPopup"), // Element representing the modal popup.
};

/**
 * Updates the text content of a DOM element.
 * @param {Element} element - The DOM element whose text content will be updated.
 * @param {string} text - The text to be set as the content of the element.
 * @param {string} [suffix=''] - An optional suffix to be appended to the text.
 */
function updateElementText(element, text, suffix = "") {
  // Set the innerText of the element to the provided text combined with the optional suffix.
  element.innerText = text + suffix;
}

/**
 * This function displays a popup with information about a planet.
 * @param {Object} planetData - An object containing various data about a planet.
 */
function showModularPopup(planetData) {
  // Update the text of the title element with the planet's name.
  updateElementText(elements.title, planetData.name);

  // Update the text of the latin name element with the planet's Latin name.
  updateElementText(elements.latinName, planetData.latinName);

  // Update the text of the info element with the planet's description.
  updateElementText(elements.info, planetData.desc);

  // Update the text of the circumference element with the planet's circumference, adding ' km' for kilometers.
  updateElementText(elements.circumference, planetData.circumference, " km");

  // Update the text of the distance element with the planet's distance from the sun, adding ' km'.
  updateElementText(elements.distance, planetData.distance, " km");

  // Update the text of the temperature during day element with the planet's day temperature, adding ' C' for Celsius.
  // The ?. operator is used for safety in case the 'day' property does not exist in the temp object.
  updateElementText(elements.tempDay, planetData.temp?.day, " C");

  // Update the text of the temperature during night element with the planet's night temperature, adding ' C'.
  updateElementText(elements.tempNight, planetData.temp?.night, " C");

  // Update the text of the moons element with a list of the planet's moons.
  // If there are no moons (moons property does not exist or is empty), it shows "Ingen Måne" (no moon in Swedish).
  updateElementText(
    elements.moons,
    planetData.moons?.join(", ") || "Ingen Måne"
  );

  // Change the display style of the modal popup to 'flex', making it visible on the screen.
  elements.modalPopup.style.display = "flex";
}

/**
 * This function closes the modular popup.
 */
function closeModular() {
  // Change the display style of the modal popup to 'none', hiding it from view.
  elements.modalPopup.style.display = "none";
}

/**
 * The main function is marked as async, which means it can perform asynchronous operations like fetching data from an API.
 */
async function main() {
  try {
    // Try to perform the following operations, and if any errors occur, catch them.

    // Wait for the API key to be fetched.
    const apiKey = await getApiKey();
    // Log the fetched API key for debugging purposes.
    console.log(`Api key from main: ${apiKey}`);

    // Wait for the astronomical bodies data to be fetched using the API key.
    const bodies = await getBodies(apiKey);
    // Log the fetched bodies for debugging.
    console.log(bodies);

    // Set up event listeners for each element with the class 'planet'.
    document.querySelectorAll(".planet").forEach((planet) => {
      // For each planet element, add a click event listener.
      planet.addEventListener("click", () => {
        // When a planet is clicked, handle the click event.
        handlePlanetClick(planet, apiKey);
      });
    });
  } catch (error) {
    // If an error occurs in the try block, log it to the console.
    console.error("Error in main function:", error);
  }
}

// Asynchronous function to handle clicks on planet elements.
async function handlePlanetClick(planetElement, apiKey) {
  try {
    // Retrieve planet name from the element and fetch its data.
    const planetName = planetElement.getAttribute("data-name");
    await fetchPlanetData(planetName, apiKey);
  } catch (error) {
    // Log any errors that occur during the fetch process.
    console.error(`Error handling planet click:`, error);
  }
}

// Asynchronous function to fetch data for a given planet and display it in a popup.
async function fetchPlanetData(planetName, apiKey) {
  try {
    // Fetch all celestial bodies' data and find the specific planet data.
    const bodies = await getBodies(apiKey);
    const planetData = bodies.find((planet) => planet.name === planetName);

    // Prepare the data for the popup, defaulting to a message if no data is found.
    const popupData = planetData || { name: planetName, desc: "No data found" };
    showModularPopup(popupData);
  } catch (error) {
    // Log and handle any errors, showing an error message in the popup.
    console.error(`Error fetching planet data:`, error);
    showModularPopup({ name: planetName, desc: "Error fetching planet data" });
  }
}

// Base URL for accessing the API endpoints.
const url = "https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com";

// Asynchronous function to retrieve an API key from a specified URL.
async function getApiKey() {
  try {
    // Send a POST request to the server and validate the response.
    const response = await fetch(`${url}/keys`, { method: "POST" });
    if (!response.ok) throw new Error(`HTTP error status ${response.status}`);

    // Extract the API key from the response and log it to the console.
    const { key } = await response.json();
    console.log("API key:", key);
    return key;
  } catch (error) {
    // Log any errors that occur during fetching the API key.
    console.error("Error fetching API key:", error);
  }
}

/**
 * Asynchronously fetches data about astronomical bodies from an API.
 * @param {string} apiKey - The API key required to access the API.
 * @returns {Array} An array of bodies if successful, or an empty array if an error occurs.
 */
async function getBodies(apiKey) {
  // Log the API key to the console for debugging purposes.
  console.log("API key:", apiKey);

  try {
    // Try to perform the following operations. If an error occurs, it will be caught by the catch block.

    // Await the fetch call to get the response from the API.
    // `${url}/bodies` is the API endpoint from where we are fetching the data.
    // The method "GET" indicates that we are retrieving data.
    // Headers contain the API key needed to authenticate the request.
    const response = await fetch(`${url}/bodies`, {
      method: "GET",
      headers: { "x-zocom": apiKey },
    });

    // Check if the response status is not OK (e.g., 200, 201, etc.).
    // If it's not OK, throw an error with the response status.
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Await the parsing of the JSON response body.
    // This converts the response from JSON format to a JavaScript object.
    const data = await response.json();

    // Return the 'bodies' property of the parsed data, or an empty array if 'bodies' is not present.
    return data.bodies || [];
  } catch (error) {
    // If an error occurs in the try block, log it to the console.
    console.error("Error fetching bodies:", error);

    // Return an empty array in case of an error.
    return [];
  }
}

/** Creating stars random  */

// Selects the element with class "stars" from the document (HTML page)
const starContainer = document.querySelector(".stars");

// Sets the number of stars to be created
const NUM_STARS = 60;

// Sets the CSS class name that will be used for each star
const STAR_CLASS = "star";

// Function to generate a random position along an axis (either width or height)
function getRandomPosition(axis) {
  return `${Math.random() * 100}${axis}`; // Returns a random percentage value along the given axis
}

// Function to create stars and add them to the starContainer
function createStars() {
  const fragment = document.createDocumentFragment(); // Creates a document fragment to hold the stars

  for (let i = 0; i < NUM_STARS; i++) {
    const star = document.createElement("div"); // Creates a new div element for each star
    star.className = STAR_CLASS; // Assigns the star class to the new div
    star.style.left = getRandomPosition("vw"); // Sets a random horizontal position (in viewport width units)
    star.style.top = getRandomPosition("vh"); // Sets a random vertical position (in viewport height units)
    fragment.appendChild(star); // Adds the star to the document fragment
  }

  starContainer.appendChild(fragment); // Adds all the stars in the fragment to the starContainer
}

createStars(); // Calls the function to create and display the stars
