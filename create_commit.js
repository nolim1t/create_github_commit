
module.exports = function(info, callback) {
  // Libraries
  const request = require('request');
  const process = require('process');

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

  // Build up the URL
  var auth_info = username + ":" + apikey + "@";
  var url_prefix = "https://" + auth_info + "api.github.com/repos/" + username + "/" + repo + "/git/";
  // Build Request object
  var requestObjParams = {
    method: 'GET',
    uri: url_prefix + "refs/heads/master",
    headers: {
      'User-Agent': "I'm a little teapot!"
    }
  };
  if (info.fileobject !== undefined) {
    var github_filename = info.fileobject['filename'] || 'test.md';
    var github_file_contents = info.fileobject['contents'] || "# Hello World\n\n## Title 1\n\nI love github. It's cool because I can create files using the API";
    if (info.fileobject['encoded'] == undefined) { // if encoded is not set then encode it
      github_file_contents = new Buffer(github_file_contents).toString('base64')
    }
    var file_mode = info.fileobject['filemode'] || '100644';
    var git_commit_message = info.fileobject['commit_message'] || 'Lets make a change now!';
    var author_block = info.fileobject['commit_author'] || {"name": "nolim1t", "email": "github-commit@nolim1t.co", "date": ISODateString(new Date())};
    var github_branch_ref_to_commit = info.fileobject['branch_ref'] || "refs/heads/master";

    // Step 1: Grab SHA
    request(requestObjParams, function(s1error, s1response, s1body) {
      if (!s1error) {
        var step1_body = JSON.parse(s1body);
        if (step1_body['object'] !== undefined) {
          if (step1_body['object']['type'] !== undefined) {
            if (step1_body['object']['type'] == "commit") {
              // SHA of Last commit is used to get more details of the last commit (this time the tree)
              requestObjParams['uri'] = url_prefix + "commits/" + step1_body['object']['sha'];
              request(requestObjParams, function(s2error, s2response, s2body) {
                if (s2response.statusCode == 200) {
                  var step2_body = JSON.parse(s2body);
                  // Build a BLOB with the file contents and encode it base64
                  requestObjParams['uri'] = url_prefix + "blobs";
                  requestObjParams['method'] = 'POST';
                  requestObjParams['body'] = JSON.stringify({
                    "content": github_file_contents,
                    "encoding": "base64"
                  });
                  requestObjParams['headers']['content-type'] = 'application/json';
                  request(requestObjParams, function(s25error, s25response, s25body) {
                    if (s25response.statusCode == 200 || s25response.statusCode == 201) {
                      var step25_body = JSON.parse(s25body);
                      if (step25_body['sha'] !== undefined) {
                        // Create a new tree
                        requestObjParams['uri'] = url_prefix + "trees"
                        requestObjParams['body'] = JSON.stringify({
                          "base_tree": step2_body['tree']['sha'],
                          "tree": [
                            {
                              "path": github_filename,
                              "mode": file_mode,
                              "type": "blob",
                              "sha": step25_body['sha']
                            }
                          ]
                        });
                        request(requestObjParams, function(s35error, s35response, s35body) {
                          if (s35response.statusCode == 200 || s35response.statusCode == 201) {
                            var step35_body = JSON.parse(s35body);
                            if (step35_body['sha'] !== undefined) {
                              requestObjParams["uri"] = url_prefix + "commits";
                              requestObjParams['body'] = JSON.stringify({
                                "parents": [
                                  step1_body['object']['sha']
                                ],
                                "tree": step35_body['sha'],
                                "message": git_commit_message,
                                "author": author_block
                              });
                              request(requestObjParams, function(s4error, s4response, s4body) {
                                if (s4response.statusCode == 200 || s4response.statusCode == 201) {
                                  var step4_body = JSON.parse(s4body);
                                  if (step4_body['sha'] !== undefined) {
                                    // last step
                                    requestObjParams['uri'] = "https://" + username + ":" + apikey + "@api.github.com/repos/" + username + "/" + repo + "/git/refs/heads/master"
                                    requestObjParams['body'] = JSON.stringify({
                                      "ref": github_branch_ref_to_commit,
                                      "sha": step4_body['sha']
                                    });
                                    request(requestObjParams, function(s5error, s5response, s5body) {
                                      if (s5response.statusCode == 200 || s5response.statusCode == 201) {
                                        var step5_body = JSON.parse(s5body);
                                        if (step5_body['object'] !== undefined) {
                                          if (step5_body['object']['sha'] !== undefined) {
                                            callback({message: "Ok", last_commit_sha: step1_body['object']['sha'], tree_sha: step2_body['tree']['sha'], blob_sha: step25_body['sha'], new_tree_sha: step35_body['sha'], commit_sha: step4_body['sha'], commit_to_branch_sha: step5_body['object']['sha']});
                                          } else {
                                            callback({message: "Warning - All good, except structure may have changed"});
                                          }
                                        } else {
                                          callback({message: "Warning - All good, except structure may have changed"});
                                        }
                                      } else {
                                        callback({message: "Couldnt commit to a branch"});
                                      }
                                    });
                                  } else {
                                    callback({message: "Error doing GIT commit SHA - structure changed"});
                                  }
                                } else {
                                  callback({message: "Error doing GIT commit"});
                                }
                              });
                            } else {
                              callback({message: "Can't get new tree SHA because format has changed"});
                            }
                          } else {
                            callback({message: "Can't get new tree SHA because there was a HTTP error"});
                          }
                        });
                      } else {
                        callback({message: "Blob API file format has changewd"});
                      }
                    } else {
                      callback({message: "Can't call the file blob API"});
                    }
                  });
                } else {
                  callback({message: "Error getting the tree of the last commit"});
                }
              });
            }
          } else {
            callback({message: "Error when grabbing SHA for the last commit - API changed the structure"});
          }
        } else {
          callback({message: "Error when grabbing SHA for the last commit - API changed the structure"});
        }
      } else {
        callback({message: "Error when grabbing SHA for the last commit - HTTP error"});
      }
    });
  } else {
    callback({message: "Requires: fileobject"});
  }
};
