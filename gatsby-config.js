module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-offline',
    {
      resolve: 'gatsby-source-storyblok',
      options: {
        accessToken: '8SlBxzye2tBpvdAn4kxBugtt',
        homeSlug: 'home',
        version: 'draft'
      }
    }
  ],
}
