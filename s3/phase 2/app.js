// ============================================
//  app.js — GitHub Profile Finder
//  Phase 2: Repos added (simple & beginner-friendly)
// ============================================


// --- Step 1: Grab all the HTML elements we need ---

var input       = document.getElementById('usernameInput');
var searchBtn   = document.getElementById('searchBtn');

var loadingDiv  = document.getElementById('loadingDiv');
var errorDiv    = document.getElementById('errorDiv');
var errorText   = document.getElementById('errorText');
var profileCard = document.getElementById('profileCard');

// Profile fields
var avatar      = document.getElementById('avatar');
var name        = document.getElementById('name');
var username    = document.getElementById('username');
var joinDate    = document.getElementById('joinDate');
var bio         = document.getElementById('bio');
var repos       = document.getElementById('repos');
var followers   = document.getElementById('followers');
var following   = document.getElementById('following');
var websiteRow  = document.getElementById('websiteRow');
var website     = document.getElementById('website');

// Repos section elements (Phase 2)
var reposSection  = document.getElementById('reposSection');
var reposLoading  = document.getElementById('reposLoading');
var reposHeading  = document.getElementById('reposHeading');
var reposList     = document.getElementById('reposList');


// ============================================
// --- Step 2: Helper — show only ONE main section ---
// ============================================

function showOnly(section) {
  // Hide everything first
  loadingDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  profileCard.classList.add('hidden');
  reposSection.classList.add('hidden');

  // Show just what we need
  if (section === 'loading') loadingDiv.classList.remove('hidden');
  if (section === 'error')   errorDiv.classList.remove('hidden');
  if (section === 'card')    profileCard.classList.remove('hidden');
}


// ============================================
// --- Step 3: Utility — format ISO date to "25 Jan 2023" ---
// ============================================

// Input:  "2023-01-25T12:00:00Z"  (ISO format from the API)
// Output: "25 Jan 2023"           (human-readable)

function formatDate(isoString) {
  var date = new Date(isoString);
  var options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

// Same function but adds "Joined " prefix — used on profile card
function formatJoinDate(isoString) {
  return 'Joined ' + formatDate(isoString);
}


// ============================================
// --- Step 4: fetchRepos — second API call (Phase 2) ---
// Fetches top 5 latest repos using repos_url from profile
// ============================================

async function fetchRepos(reposUrl) {

  // Show the repos section and its loading spinner
  reposSection.classList.remove('hidden');
  reposLoading.classList.remove('hidden');
  reposHeading.classList.add('hidden');
  reposList.innerHTML = ''; // clear old repos

  try {

    // Add query params: sort by latest push, get only 5
    var url = reposUrl + '?sort=pushed&direction=desc&per_page=5';
    var response = await fetch(url);

    if (!response.ok) {
      // If repos fetch fails, just hide the section silently
      reposSection.classList.add('hidden');
      return;
    }

    var repoData = await response.json();

    // Show the heading now that data is ready
    reposHeading.classList.remove('hidden');

    // If user has no repos at all
    if (repoData.length === 0) {
      reposList.innerHTML = '<li style="color:#aaa; font-size:0.88rem;">No public repositories found.</li>';
      return;
    }

    // Loop through each repo and build a card
    for (var i = 0; i < repoData.length; i++) {
      var repo = repoData[i];

      // Create <li> element
      var li = document.createElement('li');
      li.className = 'repo-card';

      // Format the "last updated" date using our utility function
      var updatedOn = repo.pushed_at ? 'Updated ' + formatDate(repo.pushed_at) : '';

      // Description (use fallback if none)
      var description = repo.description || 'No description provided.';

      // Language + colored dot (only show if language exists)
      var languageHTML = '';
      if (repo.language) {
        var dotColor = getLanguageColor(repo.language);
        languageHTML = '<span>'
          + '<span class="lang-dot" style="background:' + dotColor + '"></span>'
          + repo.language
          + '</span>';
      }

      // Stars count
      var starsHTML = '<span>⭐ ' + repo.stargazers_count + '</span>';

      // Build the inner HTML of the repo card
      li.innerHTML =
        '<a class="repo-name" href="' + repo.html_url + '" target="_blank">' + repo.name + '</a>'
        + '<p class="repo-desc">' + description + '</p>'
        + '<div class="repo-meta">'
        +   languageHTML
        +   starsHTML
        +   '<span>' + updatedOn + '</span>'
        + '</div>';

      // Add this card to the list
      reposList.appendChild(li);
    }

  } catch (err) {
    // Network error while fetching repos — hide section quietly
    reposSection.classList.add('hidden');

  } finally {
    // Always hide repos loading spinner when done
    reposLoading.classList.add('hidden');
  }
}


// ============================================
// --- Step 5: Language color helper ---
// Returns a hex color for common languages
// ============================================

function getLanguageColor(language) {
  var colors = {
    'JavaScript' : '#f1e05a',
    'TypeScript' : '#3178c6',
    'Python'     : '#3572a5',
    'HTML'       : '#e34c26',
    'CSS'        : '#563d7c',
    'Java'       : '#b07219',
    'C++'        : '#f34b7d',
    'C'          : '#555555',
    'C#'         : '#178600',
    'Ruby'       : '#701516',
    'Go'         : '#00add8',
    'Rust'       : '#dea584',
    'PHP'        : '#4f5d95',
    'Swift'      : '#f05138',
    'Kotlin'     : '#a97bff',
    'Shell'      : '#89e051',
    'Vue'        : '#41b883',
    'Dart'       : '#00b4ab',
  };

  // Return matching color, or grey if not in our list
  return colors[language] || '#aaaaaa';
}


// ============================================
// --- Step 6: searchUser — main function ---
// ============================================

async function searchUser() {

  // Get what the user typed
  var inputUsername = input.value.trim();

  // If empty, alert and stop
  if (inputUsername === '') {
    alert('Please type a GitHub username first!');
    return;
  }

  // Show loading, disable button
  showOnly('loading');
  searchBtn.disabled = true;

  try {

    // First API call — get user profile
    var response = await fetch('https://api.github.com/users/' + inputUsername);

    // 404 = user doesn't exist
    if (response.status === 404) {
      errorText.textContent = 'No user found for "' + inputUsername + '"';
      showOnly('error');
      return;
    }

    // Any other bad response
    if (!response.ok) {
      errorText.textContent = 'Something went wrong. Try again later.';
      showOnly('error');
      return;
    }

    // Parse JSON response
    var data = await response.json();

    // --- Fill in the profile card ---

    avatar.src = data.avatar_url;
    avatar.alt = data.login + "'s avatar";

    name.textContent = data.name || data.login;

    username.textContent = '@' + data.login;
    username.href = data.html_url;

    // Use our date utility
    joinDate.textContent = formatJoinDate(data.created_at);

    bio.textContent = data.bio || 'This user has no bio.';

    repos.textContent     = data.public_repos;
    followers.textContent = data.followers;
    following.textContent = data.following;

    // Show website only if it exists
    if (data.blog) {
      var url = data.blog;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      website.href = url;
      website.textContent = data.blog;
      websiteRow.classList.remove('hidden');
    } else {
      websiteRow.classList.add('hidden');
    }

    // Show the profile card
    showOnly('card');

    // Second API call — fetch repos using repos_url from profile data
    // This runs AFTER the profile card is shown (non-blocking)
    fetchRepos(data.repos_url);

  } catch (err) {
    errorText.textContent = 'Network error. Check your connection.';
    showOnly('error');

  } finally {
    searchBtn.disabled = false;
  }
}


// ============================================
// --- Step 7: Event Listeners ---
// ============================================

// Search button click
searchBtn.addEventListener('click', searchUser);

// Press Enter inside the input
input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    searchUser();
  }
});


// ============================================
// --- Step 8: Load default user on page open ---
// ============================================

window.addEventListener('load', function() {
  input.value = 'octocat';
  searchUser();
});
