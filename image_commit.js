const create_commit = require('./create_commit');

module.exports = function(info, callback) {
  // Libraries
  const request = require('request');
  const process = require('process');
  const fs = require('fs');

  // Stuff
  const apikey = info.apikey || process.env.GITHUBAPIKEY;
  const username = info.githubuser || process.env.GITHUBUSER;
  const repo = info.githubrepo || process.env.REPO;

  if (apikey == undefined) {
    callback({message: 'You need to set up either GITHUBAPIKEY environment variable or pass the "apikey" parameter'});
    return;
  }
  if (username == undefined) {
    callback({message: 'You need to set up either GITHUBUSER environment variable or pass the "githubuser" parameter'});
    return;
  }
  if (repo == undefined) {
    callback({message: 'You need to set up either REPO environment variable or pass the "githubrepo" parameter'});
    return;
  }

  // Embedded function
  function ISODateString(d){
   function pad(n){return n<10 ? '0'+n : n}
   return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getUTCHours())+':'
        + pad(d.getUTCMinutes())+':'
        + pad(d.getUTCSeconds())+'Z'}

  function base64_encode(file) {
      // read binary data
      var bitmap = fs.readFileSync(file);
      // convert binary data to base64 encoded string
      return new Buffer(bitmap).toString('base64');
  }


  if (info.fileobject !== undefined) {
    var github_filename = info.fileobject['filename'] || 'example.png';
    var github_file_contents = base64_encode(github_filename); // You can specify the contents or not
    var file_mode = info.fileobject['filemode'] || '100644';
    var git_commit_message = info.fileobject['commit_message'] || 'Lets make a change now!';
    var author_block = info.fileobject['commit_author'] || {"name": "nolim1t", "email": "github-commit@nolim1t.co", "date": ISODateString(new Date())};
    var github_branch_ref_to_commit = info.fileobject['branch_ref'] || "refs/heads/master";

    create_commit({
      apikey: apikey,
      githubuser: username,
      githubrepo: repo,
      fileobject: {
        filename: github_filename,
        contents: github_file_contents,
        encoded: true,
        filemode: file_mode,
        commit_message: git_commit_message,
        commit_author: author_block,
        branch_ref: github_branch_ref_to_commit
      }
    }, function(commitcb) {
      callback(commitcb);
    });

  } else {
    callback({message: "Requires: fileobject"});
  }
};
