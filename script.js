// API Base URL
const API_URL = "http://localhost:3000";

// State
let allPosts = [];
let currentMinViews = 0;
let currentMaxViews = 5000;

// DOM Elements
const searchInput = document.getElementById("searchInput");
const suggestionsDiv = document.getElementById("suggestions");
const minSlider = document.getElementById("minSlider");
const maxSlider = document.getElementById("maxSlider");
const minValue = document.getElementById("minValue");
const maxValue = document.getElementById("maxValue");
const applyFilterBtn = document.getElementById("applyFilter");
const postsContainer = document.getElementById("postsContainer");
const totalPostsSpan = document.getElementById("totalPosts");

// Fetch all posts from server
async function fetchPosts(queryParams = "") {
  try {
    const response = await fetch(`${API_URL}/posts${queryParams}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsContainer.innerHTML =
      '<p class="no-results">Lỗi khi tải dữ liệu từ server!</p>';
    return [];
  }
}

// Display posts in the UI
function displayPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML =
      '<p class="no-results">Không tìm thấy bài viết nào!</p>';
    totalPostsSpan.textContent = "0";
    return;
  }

  postsContainer.innerHTML = posts
    .map(
      (post) => `
        <div class="post-card">
            <h4>${post.title}</h4>
            <p><strong>ID:</strong> ${post.id}</p>
            <p class="views">👁️ ${post.views.toLocaleString()} lượt xem</p>
        </div>
    `
    )
    .join("");

  totalPostsSpan.textContent = posts.length;
}

// Load all posts on page load
async function loadAllPosts() {
  allPosts = await fetchPosts();
  displayPosts(allPosts);
}

// Search with suggestions
searchInput.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.trim();

  if (searchTerm === "") {
    suggestionsDiv.classList.remove("show");
    loadAllPosts();
    return;
  }

  // Fetch suggestions from server
  const suggestions = await fetchPosts(
    `?title_like=${encodeURIComponent(searchTerm)}`
  );

  if (suggestions.length > 0) {
    showSuggestions(suggestions);
    displayPosts(suggestions);
  } else {
    suggestionsDiv.classList.remove("show");
    displayPosts([]);
  }
});

// Show suggestions dropdown
function showSuggestions(posts) {
  if (posts.length === 0) {
    suggestionsDiv.classList.remove("show");
    return;
  }

  const uniqueTitles = [...new Set(posts.map((p) => p.title))];

  suggestionsDiv.innerHTML = uniqueTitles
    .map(
      (title) => `
        <div class="suggestion-item" data-title="${title}">
            ${title}
        </div>
    `
    )
    .join("");

  suggestionsDiv.classList.add("show");

  // Add click event to suggestions
  document.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const title = item.dataset.title;
      searchInput.value = title;
      suggestionsDiv.classList.remove("show");

      // Fetch and display posts with exact title
      const posts = await fetchPosts(
        `?title_like=${encodeURIComponent(title)}`
      );
      displayPosts(posts);
    });
  });
}

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    suggestionsDiv.classList.remove("show");
  }
});

// Slider functionality
minSlider.addEventListener("input", (e) => {
  let minVal = parseInt(e.target.value);
  let maxVal = parseInt(maxSlider.value);

  // Prevent min slider from going above max slider
  if (minVal > maxVal) {
    minSlider.value = maxVal;
    minVal = maxVal;
  }

  minValue.textContent = minVal;
  currentMinViews = minVal;
});

maxSlider.addEventListener("input", (e) => {
  let maxVal = parseInt(e.target.value);
  let minVal = parseInt(minSlider.value);

  // Prevent max slider from going below min slider
  if (maxVal < minVal) {
    maxSlider.value = minVal;
    maxVal = minVal;
  }

  maxValue.textContent = maxVal;
  currentMaxViews = maxVal;
});

// Apply filter button
applyFilterBtn.addEventListener("click", async () => {
  const searchTerm = searchInput.value.trim();

  // Build query parameters
  let queryParams = `?views_gte=${currentMinViews}&views_lte=${currentMaxViews}`;

  if (searchTerm !== "") {
    queryParams += `&title_like=${encodeURIComponent(searchTerm)}`;
  }

  const filteredPosts = await fetchPosts(queryParams);
  displayPosts(filteredPosts);
});

// Keyboard navigation for suggestions
searchInput.addEventListener("keydown", (e) => {
  const items = document.querySelectorAll(".suggestion-item");
  if (items.length === 0) return;

  const highlighted = document.querySelector(".suggestion-item.highlight");
  let index = -1;

  if (highlighted) {
    index = Array.from(items).indexOf(highlighted);
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (highlighted) highlighted.classList.remove("highlight");
    index = (index + 1) % items.length;
    items[index].classList.add("highlight");
    items[index].scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (highlighted) highlighted.classList.remove("highlight");
    index = (index - 1 + items.length) % items.length;
    items[index].classList.add("highlight");
    items[index].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlighted) {
      highlighted.click();
    }
  } else if (e.key === "Escape") {
    suggestionsDiv.classList.remove("show");
  }
});

// Initialize app
loadAllPosts();
