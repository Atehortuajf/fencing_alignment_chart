const plane = document.getElementById("plane");
const entryText = document.getElementById("entry-text");
const skipButton = document.getElementById("skip-button");
const resultsButton = document.getElementById("results-button");

let entries = [];

fetch("/static/entries.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((fetchedEntries) => {
    entries = fetchedEntries;
    initializeApp();
  })
  .catch((error) => {
    console.error("Error fetching entries:", error);
  });

function initializeApp() {
  if (entries.length === 0) {
    console.error("No entries found.");
    return;
  }

  entryText.textContent = entries[0];

  // Attach event listeners
  plane.addEventListener("click", handlePlaneClick);
  skipButton.addEventListener("click", nextEntry);
  resultsButton.addEventListener("click", () => {
    fetchResults();
  });

  drawAxes();
  drawLabels();
  nextEntry();
}

let currentEntryIndex = 0;
const responses = [];

function drawAxes() {
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("class", "axis");
  xAxis.setAttribute("x1", "0");
  xAxis.setAttribute("y1", "300");
  xAxis.setAttribute("x2", "600");
  xAxis.setAttribute("y2", "300");
  plane.appendChild(xAxis);

  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("class", "axis");
  yAxis.setAttribute("x1", "300");
  yAxis.setAttribute("y1", "0");
  yAxis.setAttribute("x2", "300");
  yAxis.setAttribute("y2", "600");
  plane.appendChild(yAxis);
}

function nextEntry() {
  if (currentEntryIndex < entries.length) {
    entryText.textContent = entries[currentEntryIndex];
  } else {
    fetchResults();
  }
}

function downloadResponses() {
  fetch("/download-responses")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const filename = "responses.json";
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch((error) => {
      console.error("Error downloading responses:", error);
    });
}

function removePointsAndLabels() {
    const points = document.querySelectorAll(".point");
    const pointLabels = document.querySelectorAll(".point-label");
  
    points.forEach((point) => {
      plane.removeChild(point);
    });
  
    pointLabels.forEach((label) => {
      plane.removeChild(label);
    });
  }

function fetchResults() {
    removePointsAndLabels();

    fetch("/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responses),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((results) => {
        plane.removeEventListener("click", handlePlaneClick);
        skipButton.style.display = "none";
        entryText.textContent = "Results";
  
        results.forEach((result) => {
          const point = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          point.setAttribute("class", "point");
          point.setAttribute("cx", result.average_x);
          point.setAttribute("cy", result.average_y);
          point.setAttribute("r", 5);
          plane.appendChild(point);
  
          const label = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          label.setAttribute("class", "point-label");
          label.setAttribute("x", result.average_x + 5);
          label.setAttribute("y", result.average_y - 5);
          label.textContent = result.entry;
          plane.appendChild(label);
        });
      })
      .catch((error) => {
        console.error("Error fetching results:", error);
      });
  }

function drawLabels() {
    const labels = [
      { text: "Normal", x: 310, y: 595 },
      { text: "Weird", x: 310, y: 15 },
      { text: "Not Wholesome", x: 10, y: 320 },
      { text: "Wholesome", x: 510, y: 320 },
    ];
  
    labels.forEach((label) => {
      const textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      textElement.setAttribute("class", "axis-label");
      textElement.setAttribute("x", label.x);
      textElement.setAttribute("y", label.y);
      textElement.textContent = label.text;
      plane.appendChild(textElement);
    });
  }

  function handlePlaneClick(event) {
    const rect = plane.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    responses.push({
      entry: entries[currentEntryIndex],
      x: x,
      y: y,
    });
  
    // Create and add the point to the plane
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("class", "point");
    point.setAttribute("cx", x);
    point.setAttribute("cy", y);
    point.setAttribute("r", 5);
    plane.appendChild(point);
  
    // Create and add the point's label to the plane
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "point-label");
    label.setAttribute("x", x + 5);
    label.setAttribute("y", y - 5);
    label.textContent = entries[currentEntryIndex];
    plane.appendChild(label);
  
    currentEntryIndex += 1;
    nextEntry();
  }

plane.addEventListener("click", handlePlaneClick);
