const StoryblokClient = require('storyblok-js-client');

const oauthToken = 'Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo';

function rollbackContent(date) {
    // date is given in year-month-day
    date = new Date(date);
    Storyblok = new StoryblokClient({ oauthToken });
    Storyblok.get(`spaces/48829/stories/345157/versions`).then(function (response) {
        const versions = response.data.versions;
        for (var i = 0; i < versions.length; ++i) {
            if ((new Date(versions[i].created_at.substring(0, 10))).getTime() < date.getTime()) {
                console.log(`Setting version to ${versions[i].id} created at ${versions[i].created_at}`);
                Storyblok.get(`spaces/48829/stories/345157/restore_with?version=${versions[i].id}`);
                break;
            }
        }
    })
}

rollbackContent("2019-05-22")
