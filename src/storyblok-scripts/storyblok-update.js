import StoryblokClient from "storyblok-js-client";

const spaceId = 48829;
const oauthToken = "Ks6V17DkmpPuaR0ngE0pXAtt-45470--xRoHE1ftj4Xe8eTxqzo";

/**
 * The migration_init can have any of the following properties:
 * "rename": a list of past names of this field. 
 *  The first name which exists as a property of this component will have its value assigned to this property.
 * "initialize": a function which takes a blok and returns the initial value of the field.
 * "replace": a list of fields to be removed. This might not be used.
 */

const updateComponentsInStoryContent = (content, components) => {
  if (!(content instanceof Object)) return;

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
  let deleteKeyList = [];
  Object.values(content).forEach((value, key) => {
    if (value instanceof Object) {
      if (value instanceof Array) {
        let deleteList = [];
        value.forEach((object, index) => {
          if (object.component && components.hasOwnProperty(object.component)) {
            deleteList.push(index);
          }
          else {
            updateComponentsInStoryContent(object, components);
          }
        });
        //deleteList.forEach((index) => { delete value[index]; })
      }
      else {
        if (value.component && components.hasOwnProperty(value.component)) {
          deleteKeyList.push(key);
        }
        else {
          updateComponentsInStoryContent(value, components);
        }
      }
    }
  });
  //deleteKeyList.forEach((key) => { delete content[key]; })
}

const getComponentUpdates = (liveComponents, sourceComponents) => {
  let postItems = [];
  let putItems = [];
  let deleteItems = [];
  let componentsPresent = {};
  Object.keys(sourceComponents).forEach((componentName) => { componentsPresent[componentName] = false; });
  liveComponents.forEach((liveComponent) => {
    let componentName = liveComponent.name;
    if (componentName in sourceComponents) {
      // Update the component on Storyblok to the latest version.
      let Comp = sourceComponents[componentName];
      let circular = false;
      while (Comp.renamed) {
        if (componentsPresent[componentName]) {
          circular = true;
          break;
        }
        componentsPresent[componentName] = true;
        componentName = Comp.renamed;
        Comp = sourceComponents[componentName];
      }
      if (circular) {
        // If there is a circular name reference, then there is no component being referred to. This should not happen.
        deleteItems.push(liveComponent);
        return;
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
        let newSettings = {...Comp.blokSettings};
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
      const Comp = sourceComponents[componentName];
      if (Comp.renamed || Comp.deprecated) {
        continue;
      }
      let newSettings = Comp.blokSettings;
      newSettings.name = componentName;
      postItems.push(newSettings);
    }
  }

  return {postItems, putItems, deleteItems};
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

  const {postItems, putItems, deleteItems} = getComponentUpdates(getResponse.data.components, components);

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

const getUpdatedStories = (stories, sourceComponents) => {
  return stories.map((story) => {
    let newStory = JSON.parse(JSON.stringify(story));
    updateComponentsInStoryContent(newStory.content, sourceComponents)
    return newStory;
  });
}

const updateStoryblokStories = async (Storyblok, components) => {
  let storyResponses = null;
  try {
    const response = await Storyblok.get(`spaces/${spaceId}/stories`);
    const storyRequests = response.data.stories.map((story) => Storyblok.get(`spaces/${spaceId}/stories/${story.id}`));
    storyResponses = await Promise.all(storyRequests);
  }
  catch (error) {
    console.error(error);
    return null;
  }
  
  let stories = storyResponses.map((storyResponse) => storyResponse.data.story);
  stories = getUpdatedStories(stories, components);

  const storyPutRequests = stories.map((story) =>  {
    return Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {story})
  });

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

const updateStoryblok = async (components) => {
  let Storyblok = new StoryblokClient({oauthToken});

  const componentResponses = await updateStoryblokComponents(Storyblok, components);
  if (componentResponses == null) return;
  const stories = await updateStoryblokStories(Storyblok, components);
}

export { updateStoryblok };
