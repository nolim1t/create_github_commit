const create_commit = require('./create_commit');

module.exports = function(info, callback) {
  // Libraries
  const request = require('request').defaults({ encoding: null }); // This is the only way to request a binary file
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
      var bitmap = fs.readFileSync(file);
      return new Buffer(bitmap).toString('base64');
  }


  if (info.fileobject !== undefined) {
    var github_filename = info.fileobject['filename'] || 'example.png';
    var github_file_contents = '';
    var file_mode = info.fileobject['filemode'] || '100644';
    var git_commit_message = info.fileobject['commit_message'] || 'Lets make a change now!';
    var author_block = info.fileobject['commit_author'] || {"name": "nolim1t", "email": "github-commit@nolim1t.co", "date": ISODateString(new Date())};
    var github_branch_ref_to_commit = info.fileobject['branch_ref'] || "refs/heads/master";

    if (info.fileobject['file_is_url'] !== undefined) {
      if (info.fileobject['filename_to_store'] !== undefined) { // Need a filename to store
        // Request the file and then base64 encode the body as a buffer
        request.get(github_filename, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            github_file_contents = new Buffer(body).toString('base64');
            // Create the commit
            create_commit({
              apikey: apikey,
              githubuser: username,
              githubrepo: repo,
              fileobject: {
                filename: info.fileobject['filename_to_store'],
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
            callback({message: "Error fetching URL"});
          }
        });
      } else {
        callback({message: "Requires 'filename_to_store' parameter in fileobject"});
      }
    } else {
      github_file_contents = base64_encode(github_filename); // grab base64 contents
      // file_is_url not set so lets do the normal flow
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
    }
  } else {
    callback({message: "Requires: fileobject"});
  }
};
