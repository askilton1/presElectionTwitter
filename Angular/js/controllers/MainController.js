app.controller('MainController', ['$http', '$scope', '$q', 'chartOptions', function($http, $scope, $q, chartOptions) {

    //===========//
    // CONSTANTS //
    //===========//
    const API_URL = 'http://politweets-1363.appspot.com/user/';
    
    // CANDIDATES

    // REPUBLICANS
    const TRUMP    = 'realdonaldtrump';
    const PENCE    = 'mike_pence';
    const CARSON   = 'realbencarson';
    const CRUZ     = 'tedcruz';
    const BUSH     = 'jebbush';
    const CHRISTIE = 'chrischristie';
    const GRAHAM   = 'lindseygrahamsc';
    const KASICH   = 'johnkasich';
    const RUBIO    = 'marcorubio';

    // DEMOCRATS
    const CLINTON  = 'hillaryclinton';
    const SANDERS  = 'berniesanders';
    const OMALLEY  = 'martinomalley';

    // INDEPENDENTS
    const JOHNSON  = 'govgaryjohnson';
    const STEIN    = 'drjillstein';
    

    const NAME_CALLING_DONALD = 'nameCallingDonald';
    const RACE_DONALD         = 'raceDonald';
    const SAD_DONALD          = 'sadDonald';
    const NAME_CALLING_LABEL  = 'Name Calling';
    const RACE_LABEL          = 'Race';
    const SAD_LABEL           = 'Using "Sad"';

    const STATUS_SOURCE      = 'statusSource';
    const RETWEETS    = 'retweetCount';
    const HOURLY      = 'hr';
    const HASHTAG     = 'hashtag';
    const DAY_OF_WEEK = 'dow';
    const DAYS_LIST   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; 
    const RT_PER_DAY  = "rtPerDay";
    const SOURCES = ["Twitter for Android", "Twitter for iPhone", "Twitter for iPad",
                     "Twitter Web Client", "Instagram", "Mobile Web (M5)", "Twitter Ads",
                     "Hootsuite", "TweetDeck", "iOS", "Periscope", "Vine for Android",
                     "Vine - Make a Scene", "Thunderclap"];

    //====================//
    // STACKED HISTOGRAMS //
    //====================//
    getDataForChart(HOURLY, d3.range(24))
    .then(function(result) {
        $scope.hourlyTweetData = result;
        $scope.hourlyLoaded = true;
    });

    getDataForChart(HASHTAG, d3.range(11))
    .then(function(result) {
        $scope.hashtagData = result;
        $scope.hashtagLoaded = true;
    });

    getDataForChart(DAY_OF_WEEK, DAYS_LIST)
    .then(function(result) {
        $scope.dowTweetData = result;
        $scope.dowLoaded = true;
    });

    getDataForChart(RT_PER_DAY, DAYS_LIST)
    .then(function(result) {
        $scope.dailyRTData = result;
        $scope.dailyRTLoaded = true;
    })

    getDataForChart(STATUS_SOURCE, SOURCES)
    .then(function(result) {
        $scope.sourcesData = result;
        $scope.sourcesLoaded = true;
    })

    //================//
    // SCATTER CHARTS //
    //================//
    getDataForChart("", "", true)
    .then(function(result) {
        $scope.scatterData = result;
        $scope.scatterLoaded = true;
    });

    //==============//
    // DONALD CHART //
    //==============//
    getDonaldData().then(function(result) {
        $scope.donaldData = result;
        $scope.donaldLoaded = true;
    });

    //===============//
    // CHART OPTIONS //
    //===============//
    $scope.donaldOptions      = chartOptions.DONALD;
    $scope.hashtagOptions     = chartOptions.HASHTAG;
    $scope.dowTweetOptions    = chartOptions.DAY_OF_WEEK;
    $scope.scatterOptions     = chartOptions.SCATTERPLOT;
    $scope.hourlyTweetOptions = chartOptions.HOURLY;
    $scope.dailyRTOptions     = chartOptions.DAILY_RT;
    $scope.sourcesOptions      = chartOptions.SOURCES;


    //===========//
    // FUNCTIONS //
    //===========//

    /**
     * Builds the histogram for Donald Trump related tweets
     *
     * @param {string} handle - The Twitter username to query
     * @return {Object} A histogram that is the basis of the chart
     */
    function getDonaldTweets(handle) {

        var url = API_URL + handle;
        var tweetData = [];
        var histogram = {};

        return $http.get(url, {cache: true}).then(function(response) {

            tweetData = response.data;

            // Initializing histogram fields
            histogram[NAME_CALLING_DONALD] = {x: NAME_CALLING_LABEL, y: 0}
            histogram[RACE_DONALD]         = {x: RACE_LABEL, y: 0}
            histogram[SAD_DONALD]          = {x: SAD_LABEL, y: 0}

            // Evaluate all tweets
            for (var i = 0; i < tweetData.length; i++) {
                
                var tweet = tweetData[i];
                
                // Update the fields with the value from the tweet
                histogram[NAME_CALLING_DONALD].y += tweet.nameCallingDonald;
                histogram[RACE_DONALD].y += tweet.raceDonald;
                histogram[SAD_DONALD].y += tweet.sadDonald;
            }

            return histogram;
        });
    }

    /**
     * Gets a histogram for Donald Trump related Tweets
     * and prepares it so that it can hook up to the chart
     *
     * @return {Object[]} Data prepared for the chart
     */
    function getDonaldData() {

        var result = [];
        var promises = [];

        // Fetch the data from the API and build the basis data
        promises.push(getDonaldTweets(TRUMP));

        // Format the data gathered from the API so
        // it can be used in a chart
        return $q.all(promises).then(function(results) {
            for (var i = 0; i < results.length; i++) {
                
                var histogram = results[i];

                for (var entry in histogram) {
                    if (histogram.hasOwnProperty(entry)) {
                        result.push({key: histogram[entry].x, values: [histogram[entry]]});
                    }
                }
            }
            return result;
        });
    }

    /**
     * A general function for fetching the histogram/scatter
     * data and preparing it for use in a chart
     *
     * @param {string} field - The Tweet data field we are tracking
     * @param {Object[]} rangeObj - A list that contains a range of values
     * related to the field to count
     * @param {boolean} scatter - Whether or not the data is for a scatterplot
     * @return {Object[]} Data prepared for the chart
     */
    function getDataForChart(field, rangeObj, scatter=false) {

        var names = [TRUMP, PENCE, CLINTON, SANDERS];
        var result = [];
        var promises = [];

        // Fetch the data from the API and build the basis data
        for (var name in names) {
            if (scatter) {
                promises.push(buildScatter(names[name]));
            }
            else {
                promises.push(buildHistogram(names[name], field, rangeObj));
            }
        }

        // Format the data gathered from the API so
        // it can be used in a chart
        return $q.all(promises).then(function(results) {

            for (var i = 0; i < results.length; i++) {
                
                var histogram = results[i];
                var data_list = [];

                for (var entry in histogram) {
                    if (histogram.hasOwnProperty(entry)) {
                        data_list.push(histogram[entry]);
                    }
                }

                result.push({key: names[i], values: data_list});
            }

            return result;
        });
    }

    /**
     * Builds the basis for a scatterplot chart
     *
     * @param {string} handle - The Twitter username to query
     * @return {Object[]} The data that is the basis for the scatterplot
     */
    function buildScatter(handle) {

        var url = API_URL + handle;
        var data = [];
        var tweetData = [];

        return $http.get(url, {cache: true}).then(function(response) {
            tweetData = response.data;

            // Evaluate all tweets
            for (var i = 0; i < tweetData.length; i++) {
                
                var tweet = tweetData[i];
                
                // Filter out tweets that are insignificant
                if (tweet.retweetCount < chartOptions.FAME_FILTER && tweet.favoriteCount < chartOptions.FAME_FILTER) {
                    continue;
                }
                
                data.push({
                    x: tweet.favoriteCount,
                    y: tweet.retweetCount,
                    body: tweet.text,
                    size: ((tweet.favoriteCount + tweet.retweetCount) / chartOptions.FAME_MAX) * chartOptions.FAME_SIZE
                });
            }
            return data;
        });
    }

    /**
     * Builds a histogram that is the basis for a chart
     *
     * @param {string} handle - The Twitter username to query
     * @param {string} field - The Tweet data field we are tracking
     * @param {Object[]} rangeObj - A list that contains a range of values
     * related to the field to count
     * @return {Object} The data that is the basis for a chart
     */
    function buildHistogram(handle, field, rangeObj) {
    
        var url = API_URL + handle;
        var histogram = {};
        var tweetData = [];

        return $http.get(url, {cache: true}).then(function(response) {
            tweetData = response.data;

            // Initialize the histogram range
            for (var i = 0; i < rangeObj.length; i++) {
                histogram[rangeObj[i]] = {key: handle, x: rangeObj[i], y: 0, count:0};
            }

            // Evaluate all tweets
            for (var i = 0; i < tweetData.length; i++) {
                var tweet = tweetData[i];
                
                // Special cases for HASHTAG chart
                if (field == HASHTAG && tweet[field] >= rangeObj.length) {
                    continue;
                }

                // Special cases for RT/DAY chart
                if (field == RT_PER_DAY) {
                    histogram[tweet[DAY_OF_WEEK]].y += tweet[RETWEETS];
                    histogram[tweet[DAY_OF_WEEK]].count += 1;
                    continue;
                }

                // Special cases for SOURCE chart
                if (field == STATUS_SOURCE) {
                    
                    // Use a Regular Expression to extract the
                    // source from the <a></a> tag
                    var regex = new RegExp('>(.*?)<');
                    var source = regex.exec(tweet[STATUS_SOURCE])[0];
                    source = source.substring(1, source.length-1);

                    histogram[source].y += 1;
                    continue;
                }

                // Increment the field's value
                histogram[tweet[field]].y += 1;
            }

            // Convert to RT/day format
            if (field == RT_PER_DAY) {
                for (var i = 0; i < rangeObj.length; i++) {
                    var histogram_val = histogram[rangeObj[i]];
                    histogram[rangeObj[i]].y = Math.round(histogram_val.y / histogram_val.count);
                }
            }

            return histogram;
        });
    }
}]);