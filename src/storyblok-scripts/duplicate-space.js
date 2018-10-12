const StoryblokClient = require('storyblok-js-client');

const oauthToken = 'Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo';

function duplicateSpace(oldSpaceName, newName) {
  let Storyblok = new StoryblokClient({ oauthToken });
  let oldSpaceId = null;

    Storyblok.get(`spaces`).then(function (response) {
      for (let space of response.data.spaces) {
        if (space.name === oldSpaceName) { // finds the space you want to duplicate and sets its ID
          oldSpaceId = space.id;
        }
        if (space.name === newName) { // if the space you want to create's name is already in use
          console.error("Given space name already exists");
          console.error("Existing Space ID: " + space.id);
          return;
        }
      }
      if (oldSpaceId === null) { // if a matching space name was not found
        console.error("Incorrect space name or space does not exist");
        return;
      }
      Storyblok.post(`spaces`, { "space": { "name": newName, "domain": "http://localhost:8000/editor?path=" }, "dup_id": oldSpaceId }).then(function (response) {
        const newSpaceId = response.data.space.id;
        // For some reason, setting the domain in the above funcition does not 
        // work. If storyblok every fixes this, then the setting of the domain 
        // below is not needed
        Storyblok.put(`spaces/${newSpaceId}`, { "space": { "domain": "http://localhost:8000/editor?path=" } }).then(function (response) {
          console.log("Newly created space ID is: " + response.data.space.id);
          console.log("Newly created space access token is: " + response.data.space.first_token);
        })
      })
    })
}

duplicateSpace(process.argv[2], process.argv[3]);