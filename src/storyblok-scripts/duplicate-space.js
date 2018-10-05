const StoryblokClient = require('storyblok-js-client')

const oauthToken = 'Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo'

function duplicateSpace(oldSpaceId, name) {
  let Storyblok = new StoryblokClient({ oauthToken });
  Storyblok.post(`spaces`, { "space": { "name": name, "domain": "http://localhost:8000/editor?path=" }, "dup_id": oldSpaceId}).then(function(response) {
    const newSpaceId = response.data.space.id;
    Storyblok.put(`spaces/${newSpaceId}`, {"space": {"domain": "http://localhost:8000/editor?path="}}).then(function(response) {
      console.log("Newly created space ID is: " + response.data.space.id)
    })
  });
}

duplicateSpace(process.argv[2], process.argv[3]);