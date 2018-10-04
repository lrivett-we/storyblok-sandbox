import StoryblokClient from "storyblok-js-client"

const spaceId = 48829;
const oauthToken = "Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo";

const renameComponent = (Storyblok, oldName, newName) => {
  const replace = (component) => {
    if (component.component && component.component === oldName) {
      component.component = newName;
    }
    for (let value of Object.values(component)) {
      if (typeof value === "object" && value != null) {
        if (value instanceof Array) {
          for (let object of value) {
            replace(object);
          }
        }
        else {
          replace(value);
        }
      }
    }
  };
  Storyblok.get(`spaces/${spaceId}/stories?contain_component=${oldName}`)
    .then((response) => {
      for (let story of response.data.stories) {
        Storyblok.get(`spaces/${spaceId}/stories/${story.id}`)
          .then((response) => {
            let story = response.data.story;
            replace(story.content);
            Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {"story": story})
              .then((response) => {
              });
          });
      }
    });
}

// To rename a component, keep the old name in the components dictionary and pass {renamed: "newName"};
// To deprecate a component, give the component the attribute "deprecated" with either the value true or a message.

const updateStoryblok = (components) => {
  let Storyblok = new StoryblokClient({oauthToken}); 
  Storyblok.get(`spaces/${spaceId}/components`)
  .then((response) => {
    const liveComponents = response.data.components;
    let componentsPresent = {};
    for (let componentName in components) {
      componentsPresent[componentName] = false;
    }
    for (let liveComponentId in liveComponents) {
      let liveComponent = liveComponents[liveComponentId];
      let componentName = liveComponent.name;
      if (componentName in components) {
        // Update the component on Storyblok to the latest version.
        let Comp = components[componentName];
        let circular = false;
        while (Comp.renamed) {
          if (componentsPresent[componentName]) {
            circular = true;
            break;
          }
          componentsPresent[componentName] = true;
          componentName = Comp.renamed;
          Comp = components[componentName];
        }
        if (circular) {
          // If there is a circular name reference, then there is no component being referred to. This should not happen.
          Storyblok.delete(`spaces/${spaceId}/components/${liveComponent.id}`, null)
            .then(() => {});
          continue;
        }
        if (Comp.deprecated) {
          let newSettings = liveComponent;
          newSettings.schema = {};
          if (Comp.deprecated === true) {
            newSettings.display_name = `DEPRECATED`;
          }
          else {
            newSettings.display_name = `DEPRECATED - ${Comp.deprecated}`;
          }
          Storyblok.put(`spaces/${spaceId}/components/${liveComponent.id}`, {component: newSettings})
            .then(() => {});
        }
        else {
          componentsPresent[componentName] = true;
          let newSettings = Comp.blokSettings;
          newSettings.name = componentName;
          Storyblok.put(`spaces/${spaceId}/components/${liveComponent.id}`, {component: newSettings})
            .then(() => {});
        }
      }
      else {
        // Remove components from Storyblok which have no corresponding class in the code.
        Storyblok.delete(`spaces/${spaceId}/components/${liveComponent.id}`, null)
          .then(() => {});
      }
    } 
    // Add all components which are in the code but not on the site.
    for (let componentName in componentsPresent) {
      if (!componentsPresent[componentName]) {
        const Comp = components[componentName];
        if (Comp.renamed || Comp.deprecated) {
          continue;
        }
        let newSettings = Comp.blokSettings;
        newSettings.name = componentName;
        Storyblok.post(`spaces/${spaceId}/components`, {component: newSettings})
          .then(() => {});
      }
    }
    // Rename all components as needed within stories.
    for (let componentName in components) {
      if (components[componentName].renamed) {
        let newComponentName = components[componentName].renamed;
        if (components[newComponentName].renamed) {
          newComponentName = components[newComponentName].renamed;
        }
        renameComponent(Storyblok, componentName, newComponentName);
      }
    }
  })
  .catch((error) => {
    // TODO - what do do here?
  });
}



export { updateStoryblok };