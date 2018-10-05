import StoryblokClient from "storyblok-js-client";

const spaceId = 48829;
const oauthToken = "Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo";

const updateComponentsFunction = (componentType, operation) => {
  const recurse = (component) => {
    if (component.component && component.component === componentType) {
      operation(component);
    }
    for (let value of Object.values(component)) {
      if (typeof value === "object" && value != null) {
        if (value instanceof Array) {
          for (let object of value) {
            recurse(object);
          }
        }
        else {
          recurse(value);
        }
      }
    }
  }
  return recurse;
}

const renameComponent = (Storyblok, oldName, newName) => {
  const replace = updateComponentsFunction(oldName, (component) => { component.component = newName; });
  
  return new Promise((resolve, reject) => {
    Storyblok.get(`spaces/${spaceId}/stories?contain_component=${oldName}`)
      .then((response) => {
        let storyUpdates = [];
        for (let story of response.data.stories) {
          storyUpdates.push(new Promise((resolve2, reject2) => {
            Storyblok.get(`spaces/${spaceId}/stories/${story.id}`)
              .then((response) => {
                let story = response.data.story;
                replace(story.content);
                Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {"story": story})
                  .then((response) => {
                    resolve2(response);
                  });
              });
          }));
        }
        Promise.all(storyUpdates)
          .then(() => {
            resolve();
          });
      });
  });
}

// For now, the migration property is called "migration_init". We can change this later. 
const performFieldMigration = (Storyblok, blokName, schema) => {
  const refactor = updateComponentsFunction(blokName, (component) => {
    for (let field in schema) {
      const fieldSchema = schema[field];
      if (fieldSchema.hasOwnProperty("migration_init") && !component.hasOwnProperty(field)){
        const migration = fieldSchema.migration_init;
        // If the migration object has a rename property, take the value of the new field from the old field.
        if (migration.rename) {
          // If we want to take a migration value from one of multiple fields, we can list them.
          if (migration.rename instanceof Array) {
            for (let renameField of migration.rename) {
              if (component.hasOwnProperty(renameField) && !component.hasOwnProperty(field)) {
                component[field] = component[renameField];
                break;
              }
            }
          }
          else if (component.hasOwnProperty(migration.rename)) {
            component[field] = component[migration.rename];
          }
        }
        // If the migration object has an initialize property, use it to initialize the field.
        else if (migration.initialize) {
          component[field] = migration.initialize(component);
        }
      }
      // TODO - decide whether or not we ever want to remove fields.
      if (fieldSchema.migration_init && fieldSchema.migration_init.replace) {
        if (component.hasOwnProperty(field)) {
          for (let replacedField of fieldSchema.migration_init.replace) {
            delete component[replacedField];
          }
        }
      }
    }
  });
  return new Promise((resolve, reject) => {
    Storyblok.get(`spaces/${spaceId}/stories?contain_component=${blokName}`)
      .then((response) => {
        let storyUpdates = [];
        for (let story of response.data.stories) {
          storyUpdates.push(new Promise((resolve2, reject2) => {
            Storyblok.get(`spaces/${spaceId}/stories/${story.id}`)
              .then((response) => {
                let story = response.data.story;
                refactor(story.content);
                Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {"story": story})
                  .then((response) => {
                    resolve2(response);
                  });
              });
          }));
        }
        Promise.all(storyUpdates)
          .then(() => {
            resolve();
          });
      });
  });
}


const updateComponentsInStoryContent = (content, components) => {
  if (components.hasOwnProperty(content.component)){
    while (components[content.component].renamed) {
      content.component = components[content.component].renamed;
    }
    const component = components[content.component];
    if (component && component.blokSettings && component.blokSettings.schema) {
      let schema = components[content.component].blokSettings.schema;
      Object.keys(schema).forEach((field) => {
        const fieldSchema = schema[field];
        if (fieldSchema.hasOwnProperty("migration_init")) {
          if (!content.hasOwnProperty(field)){
            const migration = fieldSchema.migration_init;
            // If the migration object has a rename property, take the value of the new field from the old field.
            if (migration.rename) {
              // If we want to take a migration value from one of multiple fields, we can list them.
              if (migration.rename instanceof Array) {
                content[field] = content[migration.rename.find((renameField) => (content.hasOwnProperty(renameField)))];
              }
              else if (content.hasOwnProperty(migration.rename)) {
                content[field] = content[migration.rename];
              }
            }
            // If the migration object has an initialize property, use it to initialize the field.
            else if (migration.initialize) {
              content[field] = migration.initialize(content);
            }
          }
          // TODO - decide whether or not we ever want to remove fields.
          if (fieldSchema.migration_init.replace) {
            if (content.hasOwnProperty(field)) {
              fieldSchema.migration_init.replace.forEach((replacedField) => { delete content[replacedField] });
            }
          }
        }
      });
    }
  }

  Object.values(content).forEach((value) => {
    if (typeof value == "object" && value != null) {
      if (value instanceof Array) {
        value.forEach((object) => updateComponentsInStoryContent(object, components));
      }
      else {
        updateComponentsInStoryContent(value, components);
      }
    }
  })
}

const updateStoryblokComponents = async (Storyblok, components) => {
  let getResponse = null;
  try {
    getResponse = await Storyblok.get(`spaces/${spaceId}/components`);
  }
  catch (error) {
    console.error(error);
    return null;
  }

  let postItems = [];
  let putItems = [];
  let deleteItems = [];
  const liveComponents = response.data.components;
  let componentsPresent = {};
  Object.keys(component).forEach((componentName) => { componentsPresent[componentName] = false; });
  liveComponents.forEach((liveComponent) => {
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
        deleteItems.push(liveComponent);
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
        putItems.push(newSettings);
      }
      else {
        componentsPresent[componentName] = true;
        let newSettings = Comp.blokSettings;
        newSettings.name = componentName;
        newSettings.id = liveComponent.id;
        putItems.push(newSettings);
      }
    }
    else {
      // Remove components from Storyblok which have no corresponding class in the code.
      deleteItems.push(liveComponent);
    }
  });
  // Add all components which are in the code but not on the site.
  for (let componentName in componentsPresent) {
    if (!componentsPresent[componentName]) {
      const Comp = components[componentName];
      if (Comp.renamed || Comp.deprecated) {
        continue;
      }
      let newSettings = Comp.blokSettings;
      newSettings.name = componentName;
      postItems.push(newSettings);
    }
  }

  const postRequests = postItems.map((component) => Storyblok.post(`spaces/${spaceId}/components`, {component}));
  const putRequests = putItems.map((component) => Storyblok.put(`spaces/${spaceId}/components/${component.id}`, {component}));
  const deleteRequests = deleteItems.map((component) => Storyblok.delete(`spaces/${spaceId}/components/${component.id}`, null));

  try {
    return await Promise.all(postRequests.concat(putRequests).concat(deleteRequests));
  }
  catch (error) {
    console.error(error)
    return null;
  }
}

const updateStoryblokStories = async (Storyblok, components) => {
  let stories = null;
  try {
    const response = await Storyblok.get(`spaces/${spaceId}/stories`);
    const storyRequests = response.data.stories.map((story) => Storyblok.get(`spaces/${spaceId}/stories/${story.id}`));
    stories = await Promise.all(storyRequests);
  }
  catch (error) {
    console.error(error);
    return null;
  }
  
  const updatedStories = stories.map((story) => {
    updateComponentsInStoryContent(story.content);
  });

  const storyPutRequests = updatedStores.map((story) => Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {story}));

  try {
    return await Promise.all(storyPutRequests);
  } 
  catch (error) {
    console.error(error);
    return null;
  }
}

// To rename a component, keep the old name in the components dictionary and pass {renamed: "newName"};
// To deprecate a component, give the component the attribute "deprecated" with either the value true or a message.

const newUpdateStoryblok = async (components) => {
  let Storyblok = new StoryblokClient({oauthToken});

  const components = await updateStoryblokComponents(Storyblok, components);
  if (components == null) return;
  const stories = await updateStoryblokStories(Storyblok, components);
  console.log(components);
  console.log(stories);
}

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
    let renames = [];
    for (let componentName in components) {
      if (components[componentName].renamed) {
        let newComponentName = components[componentName].renamed;
        if (components[newComponentName].renamed) {
          newComponentName = components[newComponentName].renamed;
        }
        renames.push(renameComponent(Storyblok, componentName, newComponentName));
      }
    }
    // After performing all rename operations, perform schema field migration.
    Promise.all(renames)
      .then(() => {
        let refactors = [];
        for (let componentName in components) {
          if (!components[componentName].renamed) {
            let migrationNeeded = false;
            const schema = components[componentName].blokSettings.schema;
            for (let field in schema) {
              if (schema[field].migration_init) {
                migrationNeeded = true;
              }
            }
            if (migrationNeeded) {
              refactors.push(performFieldMigration(Storyblok, componentName, components[componentName].blokSettings.schema));
            }
          }
        }
        Promise.all(refactors).then(() => {});
      });
  });
}



export { updateStoryblok };