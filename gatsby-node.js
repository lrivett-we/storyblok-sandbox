const path = require('path')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const storyblokEntry = path.resolve('src/templates/storyblok-entry.js')

    graphql(
      `{
        allStoryblokEntry(
          filter: {
            full_slug: { 
              in: ["___global/toolbar", "___global/globe"]
            }
          }
        ) {
          edges {
            node {
              id
              name
              created_at
              uuid
              slug
              full_slug
              content
              is_startpage
              parent_id
              group_id
            }
          }
        }
      }`
    ).then(result => {
      if (result.errors) {
        console.log(result.errors)
        reject(result.errors)
      }

      let globalNodes = {}
      if (result.data && result.data.allStoryblokEntry && result.data.allStoryblokEntry.edges){
        const globalEntries = result.data.allStoryblokEntry.edges
        globalEntries.forEach((entry) => {
          globalNodes[entry.node.slug] = entry.node
        })
      }

      resolve(
        graphql(
          `{
            allStoryblokEntry {
              edges {
                node {
                  id
                  name
                  created_at
                  uuid
                  slug
                  full_slug
                  content
                  is_startpage
                  parent_id
                  group_id
                }
              }
            }
          }`
        ).then(result => {
          if (result.errors) {
            console.log(result.errors)
            reject(result.errors)
          }

          const entries = result.data.allStoryblokEntry.edges
          entries.forEach((entry, index) => {
            createPage({
              path: `/${entry.node.full_slug}/`,
              component: storyblokEntry,
              context: {
                globalNodes,
                story: entry.node
              }
            })
          })
        })
      )
    })
  })
}
