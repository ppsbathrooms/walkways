fetch("/api/brdata")
  .then((response) => response.json())
  .then((data) => $("#br-data").html(JSON.stringify(data)));

function pageError(errorText) {
  const errorElement = $(`<div class="page-error"><p>${errorText.toString()}</p></div>`);

  $('.errors').append(errorElement);

  errorElement.animate({
    bottom: '0'
  }, 200);

  setTimeout(function() {
    errorElement.animate({
      bottom: '-76px'
    }, 200);
  }, 4000);

  setTimeout(function() {
    errorElement.remove();
  }, 4300);
}
