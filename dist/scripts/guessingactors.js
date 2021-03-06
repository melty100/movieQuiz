$(document).ready(function() {
    //everything is working at this pointvar startRunningScripts = false;
    var MovieCastArray = [];
    var userAnswersArray = [];
    var ComputerMovieIdArray = [];
    var apiKey = "api_key=a610c6a9537cc833aef3465e46fba9e6&language=en-US&query";
    var giphyAPI = "1I9K6gwnF2ljgEW2mzK2VdGc4CU7iX8g";
    var apiDomain = "https://api.themoviedb.org/3/"; //score related items
    var remainingLife = 3;
    var currentScore = 0; //Button Pressed by user to submit an answer
    var actorIdNumber;
    var movieID;
    var userInput;
    var userCurrentScore = JSON.parse(localStorage.getItem("userHighScore")) || 0;

    $(document).ready(function() {
        $("#userHighScore").text(userCurrentScore)
    });

    // console.log(userCurrentScore)

    $("#userSubmit").on("click", standardGame); //StandardGame function is what determines if the first or second round script should run. If the movie cast array equals zero, then computer knows to run the firstRound Script which will not provide any points. The seconds round script will run after that and check to make sure the user isn't inputting the same actor twice. It also adds points to the current score.

    function standardGame() {
        var movieArrayLength = MovieCastArray.length;
        if (movieArrayLength === 0) {
            userInput = $("#userInput").val();
            userAnswersArray.push(userInput);
            remainingLife = 3;

            $("#startingText").text("Enter an actor that is in this Movie:");
            $("#life1").show();
            $("#life2").show();
            $("#life3").show();
            $("#WhyYouLost").text("");
            firstRound();
        }
        if (movieArrayLength !== 0) {
            $("#startingText").text("Enter an actor that is in this Movie:");
            secondRoundForward();
            // console.log(userAnswersArray);
        }
    } //firstRoundScript takes the users input and generate a movie they've been in based off of the actors ID. We then run the getListMoviesFromActorID to ger a list of the movies the actors been in.
    function firstRound(answer) {
        // console.log(answer);
        // console.log(userInput);
        if (userAnswersArray.indexOf(userInput) !== -1) {
            userInput = userInput;
        } else if (answer == undefined || answer == null) {
            userInput = $("#userInput").val();
        } else {
            userInput = answer;
        }
        //(answer);
        // console.log(userInput);
        //creates an array of user answers. This is how we can make sure the user doesn't enter the same actor twice in one game
        // userAnswersArray.push(userInput);
        // console.log(userAnswersArray);
        //call request from movie API
        $.ajax({
            url: apiDomain +
                "search/person?" +
                apiKey +
                "&language=en-US&query=" +
                userInput +
                "&page=1&include_adult=false",
            method: "GET",
        }).then(function(e) {
            actorIdNumber = e.results[0].id;
            // console.log(userInput);
            getListOfMoviesFromActorID(actorIdNumber);
        });
    }

    function getListOfMoviesFromActorID(actorIdNumber) {
        // console.log(actorIdNumber);
        //Takes the actors ID and finds all the movies they've been in.
        $.ajax({
            url: apiDomain +
                "person/" +
                actorIdNumber +
                "/movie_credits?" +
                apiKey +
                "&language=en-US",
            method: "GET",
        }).then(function(movieList) {
            // console.log(actorIdNumber);
            //setting a random movie title on screen. This represents the computers answers and will always be a movie the actor was in.
            // console.log(movieList);
            var randomNumber = Math.floor(Math.random() * 5);
            // console.log(randomNumber);
            var movieCastArrayLength = movieList.cast.length - 1;
            if (movieCastArrayLength === -1) {
                userWins();
            } else if (randomNumber > movieCastArrayLength) {
                firstRound();
            }
            var movieTitle = movieList.cast[randomNumber].title;
            var moviePoster = movieList.cast[randomNumber].poster_path;
            movieID = movieList.cast[randomNumber].id;
            var MovieRepeatCheck = ComputerMovieIdArray.indexOf(movieID);
            // console.log(MovieRepeatCheck); //Grabs the poster for the movie generated above and displays it on screen.        //this gets a list of Actors that were in the movie
            if (movieCastArrayLength <= 0 && MovieRepeatCheck !== -1) {
                userWins();
            } else if (
                MovieRepeatCheck !== -1 ||
                moviePoster === null ||
                movieTitle === undefined ||
                movieID === -1
            ) {
                // console.log("true");
                firstRound();
            } else {
                ComputerMovieIdArray.push(movieID);
                // console.log(ComputerMovieIdArray);
                // Adds new movie Poster Image to HTML
                // console.log(moviePoster);
                $("#moviePoster").attr(
                    "src",
                    "https://image.tmdb.org/t/p/w500" + moviePoster
                );
                $("#moviePoster").effect("slide", "show", "slow");
                $("#computerSubmision").text(movieTitle);
                // console.log("there is a movie title");
                getMovieCastMembers(movieID);
            }
        });
    }

    function userWins() {
        $("#computerSubmision").text(
            "Dang! I can't think of anything.... you win! Enter a another actors name to play again!"
        );
        let userHighScore = parseInt($("#userHighScore").text());
        let userCurrentScore = parseInt($("#userCurrentScore").text());
        if (userCurrentScore > userHighScore) {
            $("#userHighScore").text(userCurrentScore);
            localStorage.setItem("userHighScore", JSON.stringify(userCurrentScore));
        }
        currentScore = 0;
        $("#userCurrentScore").text(currentScore);
        //Clears user text input
        $("#userInput").val("");
        userAnswersArray = [];
        MovieCastArray = [];
    }

    function getMovieCastMembers(movieID) {
        $.ajax({
            url: apiDomain +
                "movie/" +
                movieID +
                "/credits?" +
                apiKey +
                "&page=1&include_adult=false",
            method: "GET",
        }).then(function(result) {
            //this provides the first 40 actors listed on the cast sheet. We can increase this if needed.
            // console.log(movieID);
            MovieCastArray = [];
            // console.log(result);
            for (let i = 0; i < result.cast.length; i++) {
                var movieCastMember = result.cast[i].name;
                MovieCastArray.push(movieCastMember);
            }
            //this removes the actor the user just entered so they can't use it twice
            var MovieCastArrayPop = MovieCastArray.indexOf(userInput);
            MovieCastArray.splice(MovieCastArrayPop, 1);
            // console.log(MovieCastArray);
            //Clears user text input
            $("#userInput").val("");
        });
    }

    var answer;

    function secondRoundForward() {
        // console.log(userInput);
        check = $("#userInput").val();
        // gets the users current input
        if (check !== "") {
            userInput = $("#userInput").val();
        }
        // console.log(userInput);
        // checks to make sure that it is not on the array of answers by making sure this function returns a -1
        var repeatAnswer = userAnswersArray.indexOf(userInput);
        // checks to make sure that the actor is on the array of answers by making sure this function does not return -1
        // var answerCheck = MovieCastArray.indexOf(userInput);
        var isvalidanswer = false;
        MovieCastArray.forEach(function(item) {
            if (item.levenstein(userInput) <= 2) {
                isvalidanswer = true;
                answer = item;
            } else {
                answer = answer;
            }
        });

        // console.log(repeatAnswer);
        // console.log(answerCheck);
        // if (answerCheck !== -1 && repeatAnswer === -1) {
        if (isvalidanswer && repeatAnswer === -1) {
            $("#WhyYouLost").text(answer + " was correct!");
            userAnswersArray.push(answer);
            //Adds 1 to the user Score
            currentScore++;
            $("#userCurrentScore").text(currentScore);
            //Runs the first round script again
            firstRound(answer);
            //Clears user text input
            // $("#userInput").val("");
        } else if (remainingLife > 1 && $("#userInput").val() === "") {
            if (remainingLife === 2) {
                $("#WhyYouLost").text(
                    "Smart move skipping that one! " + (remainingLife - 1) + " live left"
                );
            } else {
                $("#WhyYouLost").text(
                    "Smart move skipping that one! " + (remainingLife - 1) + " lives left"
                );
            }

            // $("#moviePoster").effect(
            //     "shake", "show", "slow"
            // );
            $("#computerSubmision").effect("bounce", "show", "slow");
            $("#life" + remainingLife).hide("explode", { duration: 1000 }, "slow");
            remainingLife--;
            // console.log(userInput);
            ComputerMovieIdArray.push(movieID);
            getListOfMoviesFromActorID(actorIdNumber);

            //Clears user text input
            $("#userInput").val("");
        } else if (remainingLife > 1 && $("#userInput").val() !== "") {
            $("#WhyYouLost").text(
                "You said them already or they aren't in the movie. " +
                (remainingLife - 1) +
                " lives left"
            );
            // $("#moviePoster").effect(
            //     "shake", "show", "slow"
            // );
            $("#computerSubmision").effect("bounce", "show", "slow");
            $("#life" + remainingLife).hide("explode", { duration: 1000 }, "slow");
            remainingLife--;
            // console.log(userInput);
            ComputerMovieIdArray.push(movieID);
            getListOfMoviesFromActorID(actorIdNumber);

            //Clears user text input
            $("#userInput").val("");
        } else {
            $("#WhyYouLost").text("You lose! Your final score was " + currentScore);
            //Tells the user they were wrong and asks them to restart by typing a name. Also removes the movie poster
            $("#computerSubmision").text(
                "You're out of lives! Enter a name below to restart!"
            );
            // $("#moviePoster").attr("src", ""); //Clears out users data
            postGif();
            userAnswersArray = [];
            ComputerMovieIdArray = [];
            //updates highscore if the users current game is better
            let userHighScore = parseInt($("#userHighScore").text());
            let userCurrentScore = parseInt($("#userCurrentScore").text());
            if (userCurrentScore > userHighScore) {
                $("#userHighScore").text(userCurrentScore);
                localStorage.setItem("userHighScore", JSON.stringify(userCurrentScore));
            }
            $("#life1").hide(); //Sets current score equal to zero again
            currentScore = 0;
            $("#userCurrentScore").text(currentScore);
            //Clears user text input
            $("#userInput").val("");
            userAnswersArray = [];
            MovieCastArray = [];
        }
    }

    // Allowing some eddit distance for typos
    String.prototype.levenstein = function(string) {
        var a = this,
            b = string + "",
            m = [],
            i,
            j,
            min = Math.min;
        if (!(a && b)) return (b || a).length;
        for (i = 0; i <= b.length; m[i] = [i++]);
        for (j = 0; j <= a.length; m[0][j] = j++);
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                m[i][j] =
                    b.charAt(i - 1) == a.charAt(j - 1) ?
                    m[i - 1][j - 1] :
                    (m[i][j] = min(
                        m[i - 1][j - 1] + 1,
                        min(m[i][j - 1] + 1, m[i - 1][j])
                    ));
            }
        }
        return m[b.length][a.length];
    };

    function postGif() {
        let query = "you lose";
        let giphyQuery =
            "https://api.giphy.com/v1/gifs/search?api_key=" +
            giphyAPI +
            "&q=" +
            query +
            "&limit=25&offset=0&rating=g&lang=en";
        $.ajax({
            url: giphyQuery,
            method: "GET",
        }).then(function(response) {
            let randomIndex = Math.floor(Math.random() * (response.data.length - 1));
            $("#moviePoster").attr(
                "src",
                response.data[randomIndex].images.original.url
            );
        });
    }

    $(function() {
        var actorsNames = [
            "Morgan Freeman",
            "Leonardo DiCaprio",
            "Robert De Niro",
            "Brad Pitt",
            "Michael Caine",
            "Matt Damon",
            "Tom Hanks",
            "Christian Bale",
            "Al Pacino",
            "Gary Oldman",
            "Edward Norton",
            "Harrison Ford",
            "Johnny Depp",
            "Cillian Murphy",
            "Jack Nicholson",
            "Bruce Willis",
            "Ralph Fiennes",
            "Kevin Spacey",
            "Samuel L. Jackson",
            "Robert Duvall",
            "Philip Seymour Hoffman",
            "Tom Hardy",
            "Steve Buscemi",
            "George Clooney",
            "Mark Ruffalo",
            "Liam Neeson",
            "Tom Cruise",
            "Jude Law",
            "Jake Gyllenhaal",
            "Russell Crowe",
            "Clint Eastwood",
            "Joseph Gordon-Levitt",
            "Ryan Gosling",
            "Woody Harrelson",
            "Bradley Cooper",
            "Denzel Washington",
            "Tim Robbins",
            "Ben Affleck",
            "Matthew McConaughey",
            "Christopher Waltz",
            "Heath Ledger",
            "Bill Murray",
            "Will Ferrell",
            "Will Smith",
            "Adam Sandler",
            "Robert Downey Jr.",
            "Chris Evans",
            "Jennifer Lawrence",
            "Morgot Robbie",
            "Ryan Reynolds",
            "Scarlett Johansson",
            "Paul Rudd",
            "Chris Hemsworth",
            "Dwayne Johnson",
            "Jamie Foxx",
            "Emma Stone",
            "Nicolas Cage",
            "Chris Pratt",
            "Ben Stiller",
            "Vin Diesel",
            "Charlize Theron",
            "Mark Wahlberg",
            "Jennifer Aniston",
            "Sandra Bullock"
        ];
        $("#userInput").autocomplete({
            source: actorsNames,
        });
    });

    $( function() {
        $( document ).tooltip();
      });
});