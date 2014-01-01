module.exports = main;

var twitter = require('twitter');
var fs = require('fs');
var when = require('when');
var apply = require('when/apply');
var argv = require('optimist')
  .usage('Usage: $0 --tweet=[tweet_id_here] --config=[/path/to/file]')
  .string(['tweet', 'config'])
  .demand(['tweet', 'config'])
  .argv;

var config = JSON.parse(fs.readFileSync(argv.config));

var client = twitter(config);

// TODO(justinabrahms): We might have some limits we're ignoring, so
// could be problematic for many retweets.

var debug = function () {};
if (argv.debug) {
  debug = console.log;
}

function main() {
  // TODO(justinabrahms): Pull from flag.
  var tweetId = argv.tweet;

  var originalTweet = fetchTweet(tweetId);
  var retweetChunks = originalTweet
    .then(fetchRetweets)
    .then(chunkIntoHundreds);

  var totalFollowers = when.map(retweetChunks, fetchFollowerCount)
    .then(calculateReach);

  when.all([originalTweet, totalFollowers], apply(outputResults));
}

function outputResults(tweet, total) {
  var count = tweet.user.followers_count;
  var percentage = ((total / count) * 100).toFixed(2);
  console.log("Original user had ", count, " followers, and the " + 
              "tweet reached a total of ", total, " people which " + 
              "is a " + percentage + "% increase.");
}

function fetchTweet(id) {
  var p = when.defer();
  debug('tweet');
  client.get('/statuses/show/' + id + '.json', {include_entities: true}, p.resolve); 
  return p.promise;
}

// Twitter's API will only user ids in groups of 100, so we need to
// chunk the result which could be bigger than 100.
function chunkIntoHundreds(userIds) {
  debug('chunk');
  var ids = [];
  while (userIds.length > 0) {
    var small = userIds.slice(0, 100);
    userIds = userIds.slice(100);
    if (small.length > 0) {
      ids.push(small);
    }
  }
  return ids;
}

function fetchFollowerCount(userIds) {
  debug('follower count on: ', userIds);
  var p = when.defer();
  client.get('/users/lookup.json', {user_id: userIds.join(',')}, function (data) {
    var total = 0;
    data.forEach(function (u) {
      total += u.followers_count;
    });
    p.resolve(total);
  });
  return p.promise;
}

function fetchRetweets(tweet) {
  debug('retweets', arguments);
  var count = tweet.retweet_count;
  var totalPages = Math.ceil(count / 100);
  return fetchRetweetPage(tweet.id_str, -1, []);
} 

function calculateReach(retweets) {
  debug('calculate', retweets);
  return when.reduce(retweets, function (a,b) {return a + b;});
}

function fetchRetweetPage(id, nextPage, acc) {
  debug('get page', arguments);
  var p = when.defer(); 

  client.get('/statuses/retweeters/ids.json', {
    id: id,
    cursor: nextPage,
    stringifyIds: true
  }, function (data) {
    if (data.statusCode >= 300) {
      return p.reject(data);
    }
    debug('individual page', data);
    acc = acc.concat(data.ids); 

    if (data.next_cursor_str === '0') {
      return p.resolve(acc); 
    } else {
      return fetchRetweetPage(id, data.next_cursor, acc);
    }
  });
  return p.promise;
}

if (require.main === module) {
  main();
}
