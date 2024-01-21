fetch("/api/brdata")
  .then((response) => response.json())
  .then((data) => $("#br-data").html(JSON.stringify(data)));