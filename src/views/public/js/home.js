fetch("/api/brdata")
  .then((response) => response.json())
  .then((data) => $("#br-data").html(JSON.stringify(data)));

const { isAuthenticated, user } = JSON.parse($('#data').html());

if (isAuthenticated) {
  $("#signInButton").hide();
  $("#signOutButton").show();
  if (user) {
    $("#user-info").html(`${user.displayName} - ${user.email}`);
  }
} else {
  $("#signInButton").show();
  $("#signOutButton").hide();
}