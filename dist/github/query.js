"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryGetMergedPRsByAuthor = void 0;
const queryGetMergedPRsByAuthor = (owner, repository, after) => {
    const query = `
  query {
    repository( ${owner ? `owner: "${owner}"` : ''}, name: "${repository}") {
      pullRequests(states: MERGED, ${after ? `after: "${after}"` : ''}, first: 100) {
        nodes {
          id,
          title,
          number
          permalink
          baseRefName
          deletions
          additions
          author {
            login
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  `;
    return query;
};
exports.queryGetMergedPRsByAuthor = queryGetMergedPRsByAuthor;
