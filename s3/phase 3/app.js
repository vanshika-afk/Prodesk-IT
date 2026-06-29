// ============================================
//  app.js — GitHub Profile Finder
//  Phase 3: Battle Mode added
//
//  New in Phase 3:
//    - Mode toggle (Normal ↔ Battle)
//    - battleUsers()  — fires 2 API calls with Promise.all()
//    - fetchAllRepos() — gets ALL repos for a user to count total stars
//    - showBattleResult() — compares stars and renders winner/loser badges
// ============================================


// ============================================
// --- Step 1: Grab all HTML elements ---
// ============================================

// --- Normal Mode elements ---
var input       = document.getElementById('usernameInput');
var searchBtn   = document.getElementById('searchBtn');

var loadingDiv  = document.getElementById('loadingDiv');
var errorDiv    = document.getElementById('errorDiv');
var errorText   = document.getElementById('errorText');
var profileCard = document.getElementById('profileCard');

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

var reposSection  = document.getElementById('reposSection');
var reposLoading  = document.getElementById('reposLoading');
var reposHeading  = document.getElementById('reposHeading');
var reposList     = document.getElementById('reposList');

// --- Mode toggle elements ---
var modeToggleBtn  = document.getElementById('modeToggleBtn');
var normalSection  = document.getElementById('normalSection');
var battleSection  = document.getElementById('battleSection');

// --- Battle Mode elements ---
var battleInput1   = document.getElementById('battleInput1');
var battleInput2   = document.getElementById('battleInput2');
var battleBtn      = document.getElementById('battleBtn');
var battleLoading  = document.getElementById('battleLoading');
var battleError    = document.getElementById('battleError');
var battleErrorText= document.getElementById('battleErrorText');
var battleResults  = document.getElementById('battleResults');
var starsComparison= document.getElementById('starsComparison');

// Battle card 1
var battleCard1    = document.getElementById('battleCard1');
var battleBadge1   = document.getElementById('battleBadge1');
var battleAvatar1  = document.getElementById('battleAvatar1');
var battleName1    = document.getElementById('battleName1');
var battleUsername1= document.getElementById('battleUsername1');
var battleRepos1   = document.getElementById('battleRepos1');
var battleFollowers1 = document.getElementById('battleFollowers1');
var battleStars1   = document.getElementById('battleStars1');

// Battle card 2
var battleCard2    = document.getElementById('battleCard2');
var battleBadge2   = document.getElementById('battleBadge2');
var battleAvatar2  = document.getElementById('battleAvatar2');
var battleName2    = document.getElementById('battleName2');
var battleUsername2= document.getElementById('battleUsername2');
var battleRepos2   = document.getElementById('battleRepos2');
var battleFollowers2 = document.getElementById('battleFollowers2');
var battleStars2   = document.getElementById('battleStars2');


// ============================================
// --- Step 2: Track which mode we are in ---
// ============================================

// isBattleMode starts as false (Normal Mode is the default)
var isBattleMode = false;


// ============================================
// --- Step 3: Mode Toggle Logic (Phase 3) ---
// Clicking the toggle button switches between
// Normal Mode and Battle Mode.
// ============================================

modeToggleBtn.addEventListener('click', function () {

  // Flip the flag
  isBattleMode = !isBattleMode;

  if (isBattleMode) {
    // Switch TO Battle Mode
    normalSection.classList.add('hidden');
    battleSection.classList.remove('hidden');
    modeToggleBtn.textContent = '← Back to Normal Mode';
    modeToggleBtn.classList.add('battle-active');
  } else {
    // Switch BACK to Normal Mode
    battleSection.classList.add('hidden');
    normalSection.classList.remove('hidden');
    modeToggleBtn.textContent = '⚔️ Enter Battle Mode';
    modeToggleBtn.classList.remove('battle-active');

    // Reset battle UI so it's clean next time
    resetBattleUI();
  }
});


// ============================================
// --- Step 4: Helper — show only ONE state in Normal Mode ---
// ============================================

function showOnly(section) {
  loadingDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  profileCard.classList.add('hidden');
  reposSection.classList.add('hidden');

  if (section === 'loading') loadingDiv.classList.remove('hidden');
  if (section === 'error')   errorDiv.classList.remove('hidden');
  if (section === 'card')    profileCard.classList.remove('hidden');
}


// ============================================
// --- Step 5: Date Utilities ---
// ============================================

function formatDate(isoString) {
  var date = new Date(isoString);
  var options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

function formatJoinDate(isoString) {
  return 'Joined ' + formatDate(isoString);
}


// ============================================
// --- Step 6: Language color helper ---
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
  return colors[language] || '#aaaaaa';
}


// ============================================
// --- Step 7: fetchRepos — Normal Mode (Phase 2, unchanged) ---
// ============================================

async function fetchRepos(reposUrl) {
  reposSection.classList.remove('hidden');
  reposLoading.classList.remove('hidden');
  reposHeading.classList.add('hidden');
  reposList.innerHTML = '';

  try {
    var url = reposUrl + '?sort=pushed&direction=desc&per_page=5';
    var response = await fetch(url);

    if (!response.ok) {
      reposSection.classList.add('hidden');
      return;
    }

    var repoData = await response.json();
    reposHeading.classList.remove('hidden');

    if (repoData.length === 0) {
      reposList.innerHTML = '<li style="color:#aaa; font-size:0.88rem;">No public repositories found.</li>';
      return;
    }

    for (var i = 0; i < repoData.length; i++) {
      var repo = repoData[i];
      var li = document.createElement('li');
      li.className = 'repo-card';

      var updatedOn = repo.pushed_at ? 'Updated ' + formatDate(repo.pushed_at) : '';
      var description = repo.description || 'No description provided.';

      var languageHTML = '';
      if (repo.language) {
        var dotColor = getLanguageColor(repo.language);
        languageHTML = '<span>'
          + '<span class="lang-dot" style="background:' + dotColor + '"></span>'
          + repo.language
          + '</span>';
      }

      li.innerHTML =
        '<a class="repo-name" href="' + repo.html_url + '" target="_blank">' + repo.name + '</a>'
        + '<p class="repo-desc">' + description + '</p>'
        + '<div class="repo-meta">'
        +   languageHTML
        +   '<span>⭐ ' + repo.stargazers_count + '</span>'
        +   '<span>' + updatedOn + '</span>'
        + '</div>';

      reposList.appendChild(li);
    }

  } catch (err) {
    reposSection.classList.add('hidden');
  } finally {
    reposLoading.classList.add('hidden');
  }
}


// ============================================
// --- Step 8: searchUser — Normal Mode (Phase 2, unchanged) ---
// ============================================

async function searchUser() {
  var inputUsername = input.value.trim();

  if (inputUsername === '') {
    alert('Please type a GitHub username first!');
    return;
  }

  showOnly('loading');
  searchBtn.disabled = true;

  try {
    var response = await fetch('https://api.github.com/users/' + inputUsername);

    if (response.status === 404) {
      errorText.textContent = 'No user found for "' + inputUsername + '"';
      showOnly('error');
      return;
    }

    if (!response.ok) {
      errorText.textContent = 'Something went wrong. Try again later.';
      showOnly('error');
      return;
    }

    var data = await response.json();

    avatar.src          = data.avatar_url;
    avatar.alt          = data.login + "'s avatar";
    name.textContent    = data.name || data.login;
    username.textContent= '@' + data.login;
    username.href       = data.html_url;
    joinDate.textContent= formatJoinDate(data.created_at);
    bio.textContent     = data.bio || 'This user has no bio.';
    repos.textContent   = data.public_repos;
    followers.textContent = data.followers;
    following.textContent = data.following;

    if (data.blog) {
      var url = data.blog;
      if (!url.startsWith('http')) url = 'https://' + url;
      website.href        = url;
      website.textContent = data.blog;
      websiteRow.classList.remove('hidden');
    } else {
      websiteRow.classList.add('hidden');
    }

    showOnly('card');
    fetchRepos(data.repos_url);

  } catch (err) {
    errorText.textContent = 'Network error. Check your connection.';
    showOnly('error');
  } finally {
    searchBtn.disabled = false;
  }
}


// ============================================
// --- Step 9: fetchAllRepos (Phase 3) ---
//
// For Battle Mode, we need the TOTAL stars across
// ALL repos — not just the first 5.
//
// Strategy: fetch up to 10 pages of 100 repos each.
// We stop early if a page has fewer than 100 results
// (that means it was the last page).
//
// Returns a number — the total star count.
// ============================================

async function fetchAllRepos(reposUrl) {

  var totalStars = 0;  // we'll add to this as we get pages
  var page = 1;

  // Loop through pages until there are no more
  while (true) {
    var url = reposUrl + '?per_page=100&page=' + page;
    var response = await fetch(url);

    // If the request fails, just return what we have so far
    if (!response.ok) break;

    var repoData = await response.json();

    // Add up stars from this page
    // Array.reduce() starts at 0 and adds each repo's stargazers_count
    totalStars = repoData.reduce(function(sum, repo) {
      return sum + repo.stargazers_count;
    }, totalStars);

    // If we got fewer than 100 repos, this was the last page — stop
    if (repoData.length < 100) break;

    // Safety cap: don't fetch more than 10 pages (1000 repos)
    if (page >= 10) break;

    page++;
  }

  return totalStars;
}


// ============================================
// --- Step 10: showBattleResult (Phase 3) ---
//
// Takes both users' data + their total stars,
// figures out who won, and updates the UI:
//   - fills in both profile cards
//   - adds winner (green) / loser (red) badges
//   - renders the star comparison bar
// ============================================

function showBattleResult(user1, stars1, user2, stars2) {

  // --- Fill in Card 1 ---
  battleAvatar1.src           = user1.avatar_url;
  battleAvatar1.alt           = user1.login + "'s avatar";
  battleName1.textContent     = user1.name || user1.login;
  battleUsername1.textContent = '@' + user1.login;
  battleUsername1.href        = user1.html_url;
  battleRepos1.textContent    = user1.public_repos;
  battleFollowers1.textContent= user1.followers;
  battleStars1.textContent    = stars1.toLocaleString(); // e.g. "12,500"

  // --- Fill in Card 2 ---
  battleAvatar2.src           = user2.avatar_url;
  battleAvatar2.alt           = user2.login + "'s avatar";
  battleName2.textContent     = user2.name || user2.login;
  battleUsername2.textContent = '@' + user2.login;
  battleUsername2.href        = user2.html_url;
  battleRepos2.textContent    = user2.public_repos;
  battleFollowers2.textContent= user2.followers;
  battleStars2.textContent    = stars2.toLocaleString();

  // --- Decide winner ---
  //
  // Three outcomes:
  //   1. User 1 has more stars  → user1 = winner, user2 = loser
  //   2. User 2 has more stars  → user2 = winner, user1 = loser
  //   3. Equal stars            → it's a tie!

  // Reset any old classes first
  battleCard1.classList.remove('winner-card', 'loser-card', 'tie-card');
  battleCard2.classList.remove('winner-card', 'loser-card', 'tie-card');
  battleBadge1.className = 'battle-badge';
  battleBadge2.className = 'battle-badge';

  if (stars1 > stars2) {
    // User 1 wins
    battleCard1.classList.add('winner-card');
    battleBadge1.classList.add('winner');
    battleBadge1.textContent = '🏆 WINNER';
    battleBadge1.classList.remove('hidden');

    battleCard2.classList.add('loser-card');
    battleBadge2.classList.add('loser');
    battleBadge2.textContent = '💀 LOSER';
    battleBadge2.classList.remove('hidden');

  } else if (stars2 > stars1) {
    // User 2 wins
    battleCard2.classList.add('winner-card');
    battleBadge2.classList.add('winner');
    battleBadge2.textContent = '🏆 WINNER';
    battleBadge2.classList.remove('hidden');

    battleCard1.classList.add('loser-card');
    battleBadge1.classList.add('loser');
    battleBadge1.textContent = '💀 LOSER';
    battleBadge1.classList.remove('hidden');

  } else {
    // Tie!
    battleCard1.classList.add('tie-card');
    battleBadge1.classList.add('tie');
    battleBadge1.textContent = '🤝 TIE';
    battleBadge1.classList.remove('hidden');

    battleCard2.classList.add('tie-card');
    battleBadge2.classList.add('tie');
    battleBadge2.textContent = '🤝 TIE';
    battleBadge2.classList.remove('hidden');
  }

  // --- Render the stars comparison bar ---
  //
  // The bar shows both users' star counts as proportional bars.
  // The user with more stars gets a 100%-wide bar;
  // the other gets a proportional width.

  var maxStars = Math.max(stars1, stars2, 1); // avoid division by zero

  // Width percentage for each bar (between 0% and 100%)
  var width1 = Math.round((stars1 / maxStars) * 100);
  var width2 = Math.round((stars2 / maxStars) * 100);

  // Bar color classes
  var barClass1, barClass2;
  if (stars1 > stars2) {
    barClass1 = 'winner-bar';
    barClass2 = 'loser-bar';
  } else if (stars2 > stars1) {
    barClass1 = 'loser-bar';
    barClass2 = 'winner-bar';
  } else {
    barClass1 = barClass2 = 'tie-bar';
  }

  // Build the comparison HTML
  starsComparison.innerHTML =
    '<h4>⭐ Total Stars Comparison</h4>'

    // Bar for user 1
    + '<div class="star-bar-row">'
    +   '<span class="star-bar-name">' + (user1.name || user1.login) + '</span>'
    +   '<div class="star-bar-track">'
    +     '<div class="star-bar-fill ' + barClass1 + '" style="width:' + width1 + '%"></div>'
    +   '</div>'
    +   '<span class="star-bar-count">' + stars1.toLocaleString() + '</span>'
    + '</div>'

    // Bar for user 2
    + '<div class="star-bar-row">'
    +   '<span class="star-bar-name">' + (user2.name || user2.login) + '</span>'
    +   '<div class="star-bar-track">'
    +     '<div class="star-bar-fill ' + barClass2 + '" style="width:' + width2 + '%"></div>'
    +   '</div>'
    +   '<span class="star-bar-count">' + stars2.toLocaleString() + '</span>'
    + '</div>';

  // Finally — show everything
  battleResults.classList.remove('hidden');
}


// ============================================
// --- Step 11: resetBattleUI (Phase 3) ---
// Cleans up battle UI when switching back to Normal Mode
// ============================================

function resetBattleUI() {
  battleLoading.classList.add('hidden');
  battleError.classList.add('hidden');
  battleResults.classList.add('hidden');
  starsComparison.innerHTML = '';
}


// ============================================
// --- Step 12: battleUsers — main Battle Mode function (Phase 3) ---
//
// 1. Read both usernames from the inputs
// 2. Show loading state
// 3. Fire BOTH profile fetches at the same time using Promise.all()
// 4. Then fire BOTH repo fetches at the same time using Promise.all()
// 5. Calculate total stars for each user
// 6. Call showBattleResult() to render everything
// ============================================

async function battleUsers() {

  var user1name = battleInput1.value.trim();
  var user2name = battleInput2.value.trim();

  if (!user1name || !user2name) {
    alert('Please enter BOTH usernames to start a battle!');
    return;
  }

  // Reset and show loading
  resetBattleUI();
  battleLoading.classList.remove('hidden');
  battleBtn.disabled = true;

  try {

    // ---- Step A: Fetch BOTH profiles at the same time ----
    //
    // Promise.all() takes an array of promises and waits for ALL of them.
    // This is faster than fetching one after the other.
    // result is an array: [response1, response2]

    var profileResponses = await Promise.all([
      fetch('https://api.github.com/users/' + user1name),
      fetch('https://api.github.com/users/' + user2name)
    ]);

    var res1 = profileResponses[0];
    var res2 = profileResponses[1];

    // Check if either user was not found
    if (res1.status === 404) {
      battleErrorText.textContent = 'User "' + user1name + '" not found on GitHub.';
      battleError.classList.remove('hidden');
      return;
    }

    if (res2.status === 404) {
      battleErrorText.textContent = 'User "' + user2name + '" not found on GitHub.';
      battleError.classList.remove('hidden');
      return;
    }

    if (!res1.ok || !res2.ok) {
      battleErrorText.textContent = 'Something went wrong. Try again later.';
      battleError.classList.remove('hidden');
      return;
    }

    // Parse both JSON responses at the same time
    var profileData = await Promise.all([res1.json(), res2.json()]);
    var userData1 = profileData[0]; // profile of user 1
    var userData2 = profileData[1]; // profile of user 2


    // ---- Step B: Fetch ALL repos for BOTH users at the same time ----
    //
    // fetchAllRepos() returns the total star count for a user.
    // We call it for both users simultaneously with Promise.all().

    var starCounts = await Promise.all([
      fetchAllRepos(userData1.repos_url),
      fetchAllRepos(userData2.repos_url)
    ]);

    var totalStars1 = starCounts[0]; // total stars for user 1
    var totalStars2 = starCounts[1]; // total stars for user 2


    // ---- Step C: Show the result ----
    battleLoading.classList.add('hidden');
    showBattleResult(userData1, totalStars1, userData2, totalStars2);

  } catch (err) {
    battleErrorText.textContent = 'Network error. Check your connection.';
    battleError.classList.remove('hidden');
  } finally {
    battleLoading.classList.add('hidden');
    battleBtn.disabled = false;
  }
}


// ============================================
// --- Step 13: Event Listeners ---
// ============================================

// Normal mode: search button and Enter key
searchBtn.addEventListener('click', searchUser);

input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') searchUser();
});

// Battle mode: battle button and Enter key on either input
battleBtn.addEventListener('click', battleUsers);

battleInput1.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') battleUsers();
});

battleInput2.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') battleUsers();
});


// ============================================
// --- Step 14: Load default user on page open ---
// ============================================

window.addEventListener('load', function () {
  input.value = 'octocat';
  searchUser();
});
