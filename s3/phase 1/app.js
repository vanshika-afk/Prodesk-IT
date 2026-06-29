// ============================================
//  app.js — GitHub Profile Finder
//  Simple & beginner-friendly version
// ============================================

// --- Step 1: Grab all the HTML elements we need ---
var input      = document.getElementById('usernameInput');
var searchBtn  = document.getElementById('searchBtn');

var loadingDiv = document.getElementById('loadingDiv');
var errorDiv   = document.getElementById('errorDiv');
var errorText  = document.getElementById('errorText');
var profileCard = document.getElementById('profileCard');

// Profile fields
var avatar     = document.getElementById('avatar');
var name       = document.getElementById('name');
var username   = document.getElementById('username');
var joinDate   = document.getElementById('joinDate');
var bio        = document.getElementById('bio');
var repos      = document.getElementById('repos');
var followers  = document.getElementById('followers');
var following  = document.getElementById('following');
var websiteRow = document.getElementById('websiteRow');
var website    = document.getElementById('website');


// --- Step 2: Helper — show only ONE section at a time ---
function showOnly(section) {
  // First hide everything
  loadingDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  profileCard.classList.add('hidden');

  // Then show what we want
  if (section === 'loading') loadingDiv.classList.remove('hidden');
  if (section === 'error')   errorDiv.classList.remove('hidden');
  if (section === 'card')    profileCard.classList.remove('hidden');
}


// --- Step 3: Helper — format date from "2011-01-25T..." to "25 Jan 2011" ---
function formatDate(isoString) {
  var date = new Date(isoString);
  var options = { day: 'numeric', month: 'short', year: 'numeric' };
  return 'Joined ' + date.toLocaleDateString('en-GB', options);
}


// --- Step 4: The main search function ---
async function searchUser() {

  // Get what the user typed, remove extra spaces
  var inputUsername = input.value.trim();

  // If empty, do nothing
  if (inputUsername === '') {
    alert('Please type a GitHub username first!');
    return;
  }

  // Show loading spinner
  showOnly('loading');

  // Disable button so user can't spam click
  searchBtn.disabled = true;

  try {

    // --- Make the API request ---
    var response = await fetch('https://api.github.com/users/' + inputUsername);

    // --- Handle 404 (user not found) ---
    if (response.status === 404) {
      errorText.textContent = 'No user found for "' + inputUsername + '"';
      showOnly('error');
      return; // stop here
    }

    // --- Handle other errors (e.g. rate limit) ---
    if (!response.ok) {
      errorText.textContent = 'Something went wrong. Try again later.';
      showOnly('error');
      return;
    }

    // --- Parse the JSON data ---
    var data = await response.json();

    // --- Fill in the profile card ---

    // Avatar image
    avatar.src = data.avatar_url;
    avatar.alt = data.login + "'s avatar";

    // Name (use login if no display name)
    name.textContent = data.name || data.login;

    // Username link
    username.textContent = '@' + data.login;
    username.href = data.html_url;

    // Join date
    joinDate.textContent = formatDate(data.created_at);

    // Bio
    bio.textContent = data.bio || 'This user has no bio.';

    // Stats
    repos.textContent     = data.public_repos;
    followers.textContent = data.followers;
    following.textContent = data.following;

    // Portfolio / website (only show if it exists)
    if (data.blog) {
      var url = data.blog;
      // Add https:// if missing
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      website.href = url;
      website.textContent = data.blog;
      websiteRow.classList.remove('hidden');
    } else {
      websiteRow.classList.add('hidden');
    }

    // Show the card!
    showOnly('card');

  } catch (error) {
    // Network error (no internet, etc.)
    errorText.textContent = 'Network error. Check your connection.';
    showOnly('error');

  } finally {
    // Always re-enable the button
    searchBtn.disabled = false;
  }
}


// --- Step 5: Event Listeners ---

// Click the Search button
searchBtn.addEventListener('click', searchUser);

// Press Enter in the input box
input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    searchUser();
  }
});


// --- Step 6: Load a default user on page open ---
window.addEventListener('load', function() {
  input.value = 'octocat';
  searchUser();
});
