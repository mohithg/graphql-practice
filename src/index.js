import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import _ from 'lodash';

const app = express();

const schema = gql`
  type Query {
    users: [User!]
    me: User
    user(id: ID!): User
    messages: [Message!]!
    message(id: ID!): Message!
  }

  type User {
    id: ID!
    username: String!
    password: String
    other: String
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
  
`;

let users = {
    1: {
        id: 1,
        username: 'First guy',
        password: 'First pass',
        messageIds: [1,2],
    },
    2: {
        id: 2,
        username: 'Second guy',
        messageIds: [2],
    }
};

let messages = {
    1: {
        id: '1',
        text: 'Hello World1',
        userId: 1
    },
    2: {
        id: '2',
        text: 'By World2',
        userId: 2
    },
};

const resolvers = {
    Query: {
        users: () => {
            return Object.values(users);
        },
        me: (parent, args, {me}) => {
            return me;
        },
        user: (parent, {id}) => {
            return users[id]
        },
        messages: () => {
            return Object.values(messages);
        },
        message: (parent, { id }) => {
            return messages[id];
        },
    },
    User: {
        username: (user) => user.username,
        messages: user => _.map(user.messageIds, (id) => (messages[id])),
    },
    Message: {
        user: (message) => {
            return users[message.userId];
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: {
        me: users[1]
    }
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});