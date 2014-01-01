tweach
======

Tweach will tell you how many people your tweet was shown to.

To install it:

```
npm install -g tweach
```

Sometimes, we get just a few retweets, but they're by folks who have
tons of followers. Take [this
tweet](https://twitter.com/HackyGoLucky/status/402883551634264064) as
an example. It only had 10 retweets, but reached over 20,000 people
due to folks like [Scott Koon](https://twitter.com/lazycoder), [Kit
Cambridge](https://twitter.com/kitcambridge) and [Chris
Williams](https://twitter.com/voodootikigod) retweeting it. 

If your curious how many folks your tweet reached, you can run
`tweach` like this:

Examples:

```
tweach --tweet=402883551634264064 --config="./config.json"
```

The number comes from the url of the tweet page. You can click on the
tweet's timestamp to get to the tweet page. Your config can be a [copy
of the config
here](https://raw.github.com/justinabrahms/tweach/master/config.json.example). You
need to fill out the keys with information pulled from the twitter
api. You can create an application on [Twitter's Developer
portal](https://dev.twitter.com/apps).

        


