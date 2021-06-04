console.log("Spotify search!");

var API_URL = "https://spicedify.herokuapp.com/spotify";

// DOM selectors
var $form = $("form");
var $resultList = $(".result-list");
var $resultTitle = $(".result-title");
var $moreButton = $(".load-more-button");

// defining global variables
var nextURL = null;
var q = null;
var type = null;
var useInfiniteScroll = location.search.indexOf("scroll=infinite") > -1;

// start adding data using Handlebars template
Handlebars.templates = Handlebars.templates || {};

var templates = document.querySelectorAll(
    'script[type="text/x-handlebars-template"]'
);

templates.forEach(function (template) {
    Handlebars.templates[template.id] = Handlebars.compile(template.innerText);
});

function renderResultsWithHandlebarTemplate(results) {
    $resultList.append(Handlebars.templates.results({ results: results }));
}
// end adding data using Handlebars template

// function to check if the user scrolled to botton ... then make ajax request
function checkScrollPosition() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        $.ajax({
            url: replaceURLName(nextURL),
            success: function (data) {
                var results = extractInfoFromData(data);
                renderResultsWithHandlebarTemplate(results.items);
                nextURL = results.next;
                if (nextURL) {
                    setTimeout(checkScrollPosition, 500);
                }
            },
        });
    } else {
        setTimeout(checkScrollPosition, 500);
    }
}

function extractInfoFromData(data) {
    // check what key does data contains (artists or albums)
    if (data.artists) {
        return data.artists;
    }
    return data.albums;
}

// replace the parts of the URL
function replaceURLName(spotifyURL) {
    return spotifyURL.replace("https://api.spotify.com/v1/search", API_URL);
}

// this function will be used when we append data without using Handlebars template
/* function renderResults(results) {
    results.forEach(function (result) {
        // create the appropriate elements

        var $img = $("<img></img>");
        var $list = $("<li></li>");
        var $link = $("<a></a>");
        var $linkURL = result.external_urls.spotify;

        // fill them with infos
        if (result.images.length < 1) {
            $img.attr("src", "https://via.placeholder.com/250");
        } else {
            $img.attr("src", result.images[0].url);
        }

        $link.attr("href", $linkURL).html(result.name);

        // append them to the $resultList
        $img.appendTo($list);
        $link.appendTo($list);
        $resultList.append($list);
    });
} */

// append the new results
function showResultsAndMoreButton(data) {
    var results = extractInfoFromData(data);
    renderResultsWithHandlebarTemplate(results.items);
    if (results.next) {
        nextURL = results.next;
        // if infinite scroll hide moreButton... otherwise show it
        if (useInfiniteScroll) {
            $moreButton.hide();
        } else {
            $moreButton.show();
        }
    }
}

$moreButton.on("click", function () {
    // making an ajax request to the nextURL
    $.ajax({
        url: replaceURLName(nextURL),
        success: function (data) {
            showResultsAndMoreButton(data);
        },
    });
});

$form.on("submit", function (event) {
    event.preventDefault();

    q = event.currentTarget[0].value;
    type = event.currentTarget[1].value;

    $.ajax({
        url: API_URL,
        data: {
            q: q, // get the textinput value
            type: type, // get the select value
        },
        success: function (data) {
            // update $resultTitle
            $resultTitle.html("You are searching for: " + q);
            // clear any previous results
            $resultList.empty();
            // keep track of the next URL
            var results = extractInfoFromData(data);
            nextURL = results.next;
            // render the results
            if (useInfiniteScroll) {
                checkScrollPosition();
            } else {
                showResultsAndMoreButton(data);
            }
        },
    });
});
