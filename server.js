const express = require("express");
const expressGraphQL = require("express-graphql");
const {
  // gives us a schema
  GraphQLSchema,
  // allows us create dynamic objects
  GraphQLObjectType,
  // allows us to use strings
  GraphQLString,
  // allows us to access lists of data (ie; list of books)
  GraphQLList,
  // allows for integars
  GraphQLInt,
  // can never return a null value
  GraphQLNonNull,
} = require("graphql");
const app = express();

// sample data of authors
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

// sample data of books written the the above authors
const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

// define the book type
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    // must return an integar, can never be null
    id: { type: GraphQLNonNull(GraphQLInt) },
    // must return an string, can never be null
    name: { type: GraphQLNonNull(GraphQLString) },
    // must return an integar, can never be null
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      // function that tells graphql where to get the information from
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents a author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      // list of books
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

// this is the query where every other query will be pulled from
const RootQueryType = new GraphQLObjectType({
  // name
  name: "Query",
  // this will notify that it's the top level query
  description: "Root Query",
  fields: () => ({
    // get a single book
    book: {
      // custom graphql object type
      type: BookType,
      description: "A Single Book",
      args: {
        id: { type: GraphQLInt },
      },
      // function that tells graphql where to the information from
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    // get list of books
    books: {
      // this is a list of books
      type: new GraphQLList(BookType),
      description: "List of All Books",
      resolve: () => books,
    },
    // get all authors
    authors: {
      // this is a list of authors
      type: new GraphQLList(AuthorType),
      description: "List of All Authors",
      resolve: () => authors,
    },
    // get single author
    author: {
      type: AuthorType,
      description: "A Single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});
/** we use mutations to modify data
 *  this acts as POST, PUT/PATCH, DELETE etc. as in REST.
 * */
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a book",
      //we need this as data to pass
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        // create a book
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        // add the book created to our array 'book'
        books.push(book);
        return book;
      },
    },
    // create a new author
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name };
        // add the author created to our array 'author'
        authors.push(author);
        return author;
      },
    },
  }),
});
// schema
const schema = new GraphQLSchema({
  // queries(GET)
  query: RootQueryType,
  // mutating (POST, PUT/PATCH, DELETE etc)
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphQL({
    // the schema is accessed in the interface
    schema: schema,
    // gives us the graphQL interface
    graphiql: true,
  })
);
app.listen(5000, () => console.log("✨#ObiDatti 2023✨"));

//////////////////////////////////////////////////////////////////////

/* * In the graphQL interface
 * to query list lists all 'books';
{
  books{
    id
    authorId
  }
}
 * to query list lists all 'authors';
{
  authors{
    id // all authors ids
    name // list of all authors names
    books{
      name
    }
  }
}
 * to query single 'book';
{
  books(id: 1){
   name // name of book with id '1'
    author{
      name // author name
    }
  }
}
 * create a new book and add to the 'book' array
/ always use the keyword 'mutation'
mutation {
  addBook(name: "New Book Name", authorId: 1){
    id // starts from the next number after the last number in the book array
    name // book name

  }
}

 * create a new author and add to the 'book' array
/ always use the keyword 'mutation'
mutation {
  addAuthor(name: "New Author Name"){
    id // starts from the next number after the last number in the author array
    name // author name

  }
}

 */
