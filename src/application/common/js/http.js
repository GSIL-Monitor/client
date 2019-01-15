import { GraphQLClient } from 'graphql-request'

const http = new GraphQLClient('http://filmarchive.oa.com/api/asset', {
    credentials: "same-origin",
}) 

export default http;