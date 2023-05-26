$(document).ready(function () {
  var searchHistory = [];

  function renderSearchHistory() {
    $(".history").empty();
    for (var i = 0; i < searchHistory.length; i++) {
      var city = searchHistory[i];
      var listItem = $("<li>").addClass("list-group-item").text(city);
      $(".history").prepend(listItem);
    }
  }

  // Event listener for list item click in search history
  $(".history").on("click", "li", function () {
    var city = $(this).text();
    handleSearch(city);
  });

  function handleSearch(city) {
    if (city !== "") {
      searchHistory.push(city);
      renderSearchHistory();
      $("#search-value").val("");

      weatherFunction(city);
      weatherForecast(city);
    }
  }

  function clearSearchHistory() {
    searchHistory = [];
    $(".history").empty();
    saveSearchHistory();
  }

  function saveSearchHistory() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  function loadSearchHistory() {
    var storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      searchHistory = JSON.parse(storedHistory);
      renderSearchHistory();
    }
  }

  function weatherFunction(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchTerm + "&appid=9bbae45a623be15f4f59423b852c2032",
    }).then(function (data) {
      if (searchHistory.indexOf(searchTerm) === -1) {
        searchHistory.push(searchTerm);
        saveSearchHistory();
        renderSearchHistory();
      }

      $("#today").empty();
      var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + " %");
      var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " K");
      var lon = data.coord.lon;
      var lat = data.coord.lat;

      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=9bbae45a623be15f4f59423b852c2032&lat=" + lat + "&lon=" + lon,
      }).then(function (response) {
        var uvColor;
        var uvResponse = response.value;
        var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(uvResponse);

        if (uvResponse < 3) {
          btn.addClass("btn-success");
        } else if (uvResponse < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        cardBody.append(uvIndex);
        $("#today .card-body").append(uvIndex.append(btn));
      });

      title.append(img);
      cardBody.append(title, temp, humid, wind);
      card.append(cardBody);
      $("#today").append(card);
    });
  }

  function weatherForecast(searchTerm) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchTerm + "&appid=9bbae45a623be15f4f59423b852c2032&units=imperial",
    }).then(function (data) {
      $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

      for (var i = 0; i < data.list.length; i++) {
        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
          var titleFive = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
          var imgFive = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
          var colFive = $("<div>").addClass("col-md-2.5");
          var cardFive = $("<div>").addClass("card bg-primary text-white");
          var cardBodyFive = $("<div>").addClass("card-body p-2");
          var tempFive = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");
          var windFive = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[i].wind.speed + " MPH");
          var humidFive = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

          colFive.append(cardFive.append(cardBodyFive.append(titleFive, imgFive, tempFive, windFive, humidFive)));
          $("#forecast .row").append(colFive);
        }
      }
    });
  }

  // Search button feature
  $("#search-button").on("click", function () {
    var searchTerm = $("#search-value").val();
    $("#search-value").val("");
    handleSearch(searchTerm);
  });

  // Search button enter key feature
  $("#search-value").keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode === 13) {
      var searchTerm = $("#search-value").val();
      $("#search-value").val("");
      handleSearch(searchTerm);
    }
  });

  $("#clear-history-button").on("click", function () {
    clearSearchHistory();
  });

  loadSearchHistory();
});



