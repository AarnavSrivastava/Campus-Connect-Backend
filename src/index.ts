require('dotenv').config();

const neo4j = require('neo4j-driver');
import { Neo4jGraphQL } from '@neo4j/graphql';
import {ApolloServer} from "apollo-server";
const { gql } = require('apollo-server');

const typeDefs = gql`
    type School @node(label: School) {
        id: ID! @id(autogenerate: true, unique: true)
        name: String!
        classes: [Class!]! @relationship(type: "Class", direction: IN)
        students: [User!]! @relationship(type: "Student", direction: IN)
    }

    type Class @node(label: Class) {
        id: ID! @id(autogenerate: true, unique: true)
        name: String!
        school: School! @relationship(type: "Class", direction: OUT)
        participants: [User!]! @relationship(type: "Class", direction: IN)
        posts: [Post!]! @relationship(type: "Post", direction: IN)
    }

    type User @node(label: User) {
        id: ID!
        email: String!
        name: String!
        photo_url: String!
        classes: [Class!]! @relationship(type: "Class", direction: OUT)
        school: School @relationship(type: "Student", direction: OUT)
        posts: [Post!]! @relationship(type: "Post", direction: IN)
        comments: [Comment!]! @relationship(type: "Comment", direction: IN)
    }

    type Post @node(label: Post) {
        id: ID! @id(autogenerate: true, unique: true)
        title: String!
        class: Class! @relationship(type: "Post", direction: OUT)
        poster: User! @relationship(type: "Poster", direction: OUT)
        files: [String!]!
        description: String!
        comments: [Comment!]! @relationship(type: "CommentOf", direction: IN)
        creation_time: String!
    }

    type Comment @node(label: Comment) {
        id: ID! @id(autogenerate: true, unique: true)
        commenter: User! @relationship(type: "Comment", direction: OUT)
        post: Post! @relationship(type: "CommentOf", direction: OUT)
        text: String!
        creation_time: String!
    }
`;

const resolvers = {
}

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const schema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver
})

function context({ event, context }: { event: any, context: any }): any {
    return ({
        event,
        context,
        driver,
    });
}

schema.getSchema().then((schema) => {
    const server: ApolloServer = new ApolloServer({
        schema,
        context,
    });
    
    
    // @ts-ignore
    server.listen().then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
});