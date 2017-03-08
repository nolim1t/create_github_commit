# Create Github Commit Library

Package site: [https://www.npmjs.com/package/create_github_commit](https://www.npmjs.com/package/create_github_commit)

## What?

This is a library which lets you create a github commit.

## Why?

It first started of with the curiosity to be able to do this with the github API. After a lot of digging online, I found that it was quite difficult to do (lets say about 5-6 steps). You can see the process in one of my [blog posts](http://www.nolim1t.co/2017/03/08/uploading-to-github-through-the-API.html)

But GitHub is not just a git hosting platform but also has a lot of cool stuff (github pages is a fantastic product). So cool that I'm actually a paying customer and love the unlimited private repositories too.

I thought that it would be cool to make a blog post programmatically to a github hosted page (or one of my static sites). But take it to the next level and create an AWS Lambda endpoint out of it.

Then I thought, this could make a cool Library so I can use it to make cool stuff with Amazon AWS Lambda.

And also, more commits means it looks nicer in your github profile now that things are supposed to be a lot more social. After all, it's a tool for developers to showcase what they are working on right?


![Github Contributions](https://raw.githubusercontent.com/nolim1t/why_i_love_github/master/github_contrib.png)

vs

![Sadface](https://raw.githubusercontent.com/nolim1t/why_i_love_github/master/nocontrib.png)

## Usage

```bash
cd ./your_project_name
npm install create_github_commit --save
```

### Example code  


#### Just basic parameters

```javascript
create_commit({fileobject: {filename: "im_a_little_teapot.md", contents: "# I'm a little teapot\n\nYet another change\n\n![Teapot yo](https://images-na.ssl-images-amazon.com/images/I/51GHlyuQ1JL._SL1200_.jpg)", commit_message: "For a good time, send bitcoins to 1Mdnjtg9CFidwxWRHjaPamfDmTJVtg4nri"}}, function(c) {console.log(c);});
```

#### Specify API Key username and repo in parameters too

```javascript
create_commit({apikey: "githubpersonalapikey", githubuser: "githubuser", githubrepo: "githubreponame", fileobject: {filename: "im_a_little_teapot.md", contents: "# I'm a little teapot\n\nYet another change\n\n![Teapot yo](https://images-na.ssl-images-amazon.com/images/I/51GHlyuQ1JL._SL1200_.jpg)", commit_message: "For a good time, send bitcoins to 1Mdnjtg9CFidwxWRHjaPamfDmTJVtg4nri"}}, function(c) {console.log(c);});
```

## TODO

Feel free to check the [help wanted](https://github.com/nolim1t/create_github_commit/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) tag. This is what I'd like to add.

* Work out how to upload images too! Would make a nice image backup tool ([#1](https://github.com/nolim1t/create_github_commit/issues/1))
* Make it work with oauth (Would actually add more usecases to this. There's already [some usecases](http://www.nolim1t.co/2017/03/08/uploading-to-github-through-the-API.html) here) [#2](https://github.com/nolim1t/create_github_commit/issues/2)
