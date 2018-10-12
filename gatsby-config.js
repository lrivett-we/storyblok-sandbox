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
        accessToken: 'or0irBaYqT3TC5aoQz4mWAtt',
        homeSlug: 'home',
        version: 'draft'
      }
    }
  ],
}
